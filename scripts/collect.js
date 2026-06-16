/**
 * collect.js — 보험설계사 데일리 뉴스 수집/큐레이션 파이프라인
 *
 * 흐름: RSS 수집 → 보험 관련 필터 → dedup → 최근 36h → Haiku 큐레이션
 *       → public/data/YYYY-MM-DD.json + latest.json 저장
 *
 * 저작권: 기사 전문 복제 금지. summary 는 Haiku 가 100% 재서술. 원문은 link 로만 연결.
 *
 * 실행: node scripts/collect.js   (ANTHROPIC_API_KEY 필요, 없으면 휴리스틱 폴백)
 */
import Parser from 'rss-parser'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// .env 로드 (Node 내장)
try { process.loadEnvFile(resolve(ROOT, '.env')) } catch { /* .env 없으면 무시 */ }

const RECENT_HOURS = 36
const MAX_CANDIDATES = 40       // Haiku 에 보낼 최대 후보 수
const SCORE_THRESHOLD = 45      // 이 점수 미만은 대시보드에서 제외
const MODEL = 'claude-haiku-4-5-20251001'
const CATEGORIES = ['생명보험', '손해보험', '건강·실손', '세금·연금', '정책·법규', '회사동향']

const { feeds, insurance_keywords } = JSON.parse(
  readFileSync(resolve(ROOT, 'sources.json'), 'utf-8')
)

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InsuranceNewsBot/0.1)' },
  customFields: { item: [['description', 'description']] },
})

// ── 1. 수집 ────────────────────────────────────────────────
async function fetchFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url)
    const items = (parsed.items || []).map((it) => ({
      title: (it.title || '').trim(),
      link: (it.link || '').trim(),
      snippet: stripHtml(it.contentSnippet || it.description || it.content || '').slice(0, 500),
      published: parseDate(it.isoDate || it.pubDate),
      source: feed.name,
      sourceId: feed.id,
      type: feed.type,
      weight: feed.weight,
    }))
    console.log(`  ✓ ${feed.name}: ${items.length}건`)
    return items
  } catch (e) {
    console.warn(`  ✗ ${feed.name} 실패: ${e.message}`)
    return []
  }
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function parseDate(s) {
  if (!s) return null
  // "2026-06-16 14:49:27" 형식(insnews/fins)은 KST 로 간주
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s.trim())
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`)
  const d = new Date(s)
  return isNaN(d) ? null : d
}

// ── 2. 필터 + dedup ────────────────────────────────────────
const KW = new RegExp(insurance_keywords.join('|'))

function isInsuranceRelevant(item) {
  if (item.type === 'insurance') return true          // 보험 전문지는 전량 통과
  return KW.test(item.title) || KW.test(item.snippet) // 경제·금융지는 키워드 필터
}

function normalizeTitle(t) {
  return t.replace(/[\s\[\]()'"·…,.\-]/g, '').toLowerCase()
}

function dedup(items) {
  const seenTitle = new Set()
  const seenLink = new Set()
  const out = []
  for (const it of items) {
    const tk = normalizeTitle(it.title)
    if (!it.title || !it.link) continue
    if (seenTitle.has(tk) || seenLink.has(it.link)) continue
    seenTitle.add(tk)
    seenLink.add(it.link)
    out.push(it)
  }
  return out
}

// ── 3. Haiku 큐레이션 ──────────────────────────────────────
async function curate(candidates) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    console.warn('\n⚠  ANTHROPIC_API_KEY 없음 → 휴리스틱 폴백으로 진행(요약 품질 낮음).')
    return candidates.map(heuristicCurate)
  }

  const client = new Anthropic({ apiKey: key })
  const list = candidates.map((c, i) =>
    `[${i}] (출처:${c.source})\n제목: ${c.title}\n발췌: ${c.snippet || '(없음)'}`
  ).join('\n\n')

  const system =
    '당신은 한국 보험설계사를 위한 뉴스 큐레이터다. ' +
    '아래 기사 목록을 보고 설계사의 영업·고객상담에 실제로 도움이 되는 기사만 선별·요약한다.\n' +
    '저작권 규칙(반드시 준수): 기사 원문을 복제하지 말고 summary 는 네 표현으로 100% 재서술한다. ' +
    '발췌문을 그대로 베끼지 않는다.\n' +
    `category 는 반드시 다음 중 하나: ${CATEGORIES.join(', ')}.\n` +
    'score 는 0~100 (설계사 업무 관련성·시의성). 광고/단순홍보/무관 기사는 40 미만으로.\n' +
    '출력은 JSON 배열만. 각 원소: ' +
    '{"i": 원본번호, "score": 정수, "category": "...", ' +
    '"summary": "2~3문장 재서술 요약", "why_matters": "설계사에게 왜 중요한지 1문장", "tag": "핵심키워드 1개"}.\n' +
    '관련 없는 기사는 배열에서 제외한다. 설명·코드펜스 없이 JSON 배열만 출력.'

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system,
    messages: [{ role: 'user', content: `기사 목록:\n\n${list}` }],
  })

  const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  const json = extractJson(text)
  const byIndex = new Map()
  for (const r of json) {
    if (typeof r.i === 'number' && candidates[r.i]) byIndex.set(r.i, r)
  }
  return candidates.map((c, i) => {
    const r = byIndex.get(i)
    if (!r) return null // 모델이 제외한 기사
    return {
      ...c,
      score: clampScore(r.score, c.weight),
      category: CATEGORIES.includes(r.category) ? r.category : '회사동향',
      summary: String(r.summary || '').trim(),
      why_matters: String(r.why_matters || '').trim(),
      tag: String(r.tag || '').trim(),
      curated: true,
    }
  }).filter(Boolean)
}

function clampScore(s, weight) {
  const base = Math.max(0, Math.min(100, Math.round(Number(s) || 0)))
  return Math.min(100, Math.round(base * (0.85 + 0.15 * weight))) // 출처 가중 소폭 반영
}

function extractJson(text) {
  let t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1)
  try { return JSON.parse(t) } catch { return [] }
}

function heuristicCurate(c) {
  const text = c.title + ' ' + c.snippet
  let category = '회사동향'
  if (/연금|세액|세금|절세|IRP|퇴직/.test(text)) category = '세금·연금'
  else if (/실손|실비|건강|암보험|치매|질병/.test(text)) category = '건강·실손'
  else if (/금감원|금융위|보험연구원|약관|개정|법|규제|IFRS|K-ICS|킥스/.test(text)) category = '정책·법규'
  else if (/생명보험|생보|종신|변액|연금보험/.test(text)) category = '생명보험'
  else if (/손해보험|손보|자동차보험|화재|배상/.test(text)) category = '손해보험'
  return {
    ...c,
    score: Math.round(60 * c.weight),
    category,
    summary: null,            // 폴백은 요약 생성 안 함(저작권: 발췌 복제 금지)
    why_matters: '',
    tag: '',
    curated: false,
  }
}

// ── 4. 메인 ────────────────────────────────────────────────
function kstDateStr(d) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d) // YYYY-MM-DD
}

async function main() {
  const now = new Date()
  console.log(`\n📡 RSS 수집 시작 (${feeds.length}개 피드)`)
  const all = (await Promise.all(feeds.map(fetchFeed))).flat()

  const cutoff = new Date(now.getTime() - RECENT_HOURS * 3600 * 1000)
  const filtered = dedup(
    all
      .filter((it) => it.published && it.published >= cutoff)
      .filter(isInsuranceRelevant)
  ).sort((a, b) => b.published - a.published)

  console.log(`\n🔎 수집 ${all.length} → 보험관련·최근${RECENT_HOURS}h·dedup 후 ${filtered.length}`)
  const candidates = filtered.slice(0, MAX_CANDIDATES)

  console.log(`🤖 Haiku 큐레이션 (${candidates.length}건)...`)
  const curated = (await curate(candidates))
    .filter((it) => it.score >= SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)

  const byCat = {}
  for (const c of CATEGORIES) byCat[c] = []
  for (const it of curated) (byCat[it.category] ||= []).push(it)

  const date = kstDateStr(now)
  const output = {
    date,
    generated_at: now.toISOString(),
    count: curated.length,
    categories: CATEGORIES,
    sources: feeds.map((f) => ({ id: f.id, name: f.name })),
    by_category: byCat,
    items: curated.map(({ weight, type, ...rest }) => rest),
  }

  const dataDir = resolve(ROOT, 'public/data')
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(resolve(dataDir, `${date}.json`), JSON.stringify(output, null, 2))
  writeFileSync(resolve(dataDir, 'latest.json'), JSON.stringify(output, null, 2))

  console.log(`\n✅ 저장: public/data/${date}.json (큐레이션 ${curated.length}건)`)
  for (const c of CATEGORIES) {
    if (byCat[c].length) console.log(`   · ${c}: ${byCat[c].length}건`)
  }
}

main().catch((e) => { console.error('실패:', e); process.exit(1) })
