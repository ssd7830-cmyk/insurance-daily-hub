// 후보 기사 덤프 (수동 큐레이션용). 필터+dedup+72h 적용 후 전체 후보를 출력.
import Parser from 'rss-parser'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { feeds, insurance_keywords } = JSON.parse(readFileSync(resolve(ROOT, 'sources.json'), 'utf-8'))
const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' }, customFields: { item: [['description', 'description']] } })
const strip = (s) => (s || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
const pdate = (s) => { if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s.trim()); if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`); const d = new Date(s); return isNaN(d) ? null : d }
const KW = new RegExp(insurance_keywords.join('|'))
const all = (await Promise.all(feeds.map(async (f) => {
  try { const p = await parser.parseURL(f.url); return (p.items || []).map((it) => ({ title: (it.title || '').trim(), link: (it.link || '').trim(), snippet: strip(it.contentSnippet || it.description || it.content).slice(0, 400), published: pdate(it.isoDate || it.pubDate), source: f.name, type: f.type })) }
  catch { return [] }
}))).flat()
const cutoff = Date.now() - 72 * 3600 * 1000
const seen = new Set()
const cand = all.filter((it) => it.published && it.published.getTime() >= cutoff)
  .filter((it) => it.type === 'insurance' || KW.test(it.title) || KW.test(it.snippet))
  .filter((it) => { const k = it.title.replace(/[\s\[\]()'"·…,.\-]/g, ''); if (!it.title || seen.has(k)) return false; seen.add(k); return true })
  .sort((a, b) => b.published - a.published)
cand.forEach((c, i) => {
  console.log(`\n[${i}] (${c.source}) ${c.published.toISOString().slice(5, 16)}`)
  console.log(`T: ${c.title}`)
  console.log(`S: ${c.snippet}`)
  console.log(`L: ${c.link}`)
})
console.log(`\n=== 총 ${cand.length}건 ===`)
