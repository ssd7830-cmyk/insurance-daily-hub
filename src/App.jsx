import { useEffect, useMemo, useState } from 'react'
import Sidebar, { MENU } from './components/Sidebar.jsx'
import CategorySection from './components/CategorySection.jsx'
import NewsCard from './components/NewsCard.jsx'
import MethodologyModal from './components/MethodologyPanel.jsx'
import Tools from './components/Tools.jsx'
import ScrapView from './components/ScrapView.jsx'
import { CAT_META, prettyDate } from './lib/ui.js'
import { useScraps } from './lib/storage.js'

const BASE = import.meta.env.BASE_URL

export default function App() {
  const [view, setView] = useState('news')
  const [dates, setDates] = useState([])
  const [dateIndex, setDateIndex] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [origin, setOrigin] = useState('국내')
  const [category, setCategory] = useState('전체')
  const [methodOpen, setMethodOpen] = useState(false)
  const { scraps, toggle, isScrapped } = useScraps()

  useEffect(() => {
    fetch(`${BASE}data/index.json`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => { setDates(j.dates); setDateIndex(j.dates.length - 1) })
      .catch(() => fetch(`${BASE}data/latest.json`).then((r) => r.json()).then((d) => { setDates([d.date]); setDateIndex(0) }).catch(() => setError('no-data')))
  }, [])

  useEffect(() => {
    if (!dates.length) return
    fetch(`${BASE}data/${dates[dateIndex]}.json`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError('no-data'))
  }, [dates, dateIndex])

  const filtered = useMemo(
    () => (data?.items || []).filter((it) => it.origin === origin),
    [data, origin],
  )
  const catCounts = useMemo(() => {
    const c = {}
    for (const it of filtered) c[it.category] = (c[it.category] || 0) + 1
    return c
  }, [filtered])

  if (error) return <Center>아직 오늘 데이터가 없습니다. <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run collect</code></Center>
  if (!data) return <Center>불러오는 중…</Center>

  const originCounts = data.origin_counts || {}
  const shown = category === '전체' ? filtered : filtered.filter((it) => it.category === category)
  const byCat = {}
  for (const c of data.categories) byCat[c] = shown.filter((it) => it.category === c)

  const nav = {
    view, onView: setView, scrapCount: scraps.length,
    dates, dateIndex, onDate: setDateIndex, origin, onOrigin: (o) => { setOrigin(o); setCategory('전체') },
    originCounts, category, onCategory: setCategory, catCounts, total: filtered.length,
    onOpenMethod: () => setMethodOpen(true), sourceCount: data.sources.length,
  }
  const scrapProps = { isScrapped, onToggleScrap: toggle }
  const viewMeta = MENU.find((m) => m.key === view)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl bg-slate-50">
        <div className="sticky top-0 hidden h-screen overflow-y-auto lg:flex">
          <Sidebar {...nav} />
        </div>

        <main className="flex-1">
          <MobileNav {...nav} />

          {/* 콘텐츠 헤더 */}
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 px-5 py-3 backdrop-blur lg:static lg:bg-transparent lg:px-8 lg:pt-6">
            <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              {view === 'news'
                ? <><span>{origin === '국내' ? '🇰🇷' : '🌏'}</span>{origin}뉴스{category !== '전체' && <span className="text-slate-400">/ {category}</span>}</>
                : <><span>{viewMeta.icon}</span>{viewMeta.label}</>}
            </h1>
            {view === 'news' && <p className="mt-0.5 text-sm text-slate-400">{prettyDate(data.date)} · 큐레이션 {shown.length}건</p>}
          </div>

          {view === 'tools' && <Tools />}
          {view === 'scrap' && <ScrapView scraps={scraps} {...scrapProps} />}
          {view === 'news' && (
            <div className="px-5 pb-16 pt-4 lg:px-8">
              {shown.length === 0 ? (
                <p className="py-24 text-center text-slate-400">이 조건에 해당하는 기사가 없습니다.</p>
              ) : category === '전체' ? (
                data.categories.map((c) => <CategorySection key={c} category={c} items={byCat[c]} {...scrapProps} />)
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((it) => <NewsCard key={it.link} item={it} scrapped={isScrapped(it.link)} onToggleScrap={toggle} />)}
                </div>
              )}
              <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
                출처: {data.sources.map((s) => s.name).join(' · ')}<br />
                요약은 AI가 재서술한 것이며, 정확한 내용은 원문을 확인하세요.
              </footer>
            </div>
          )}
        </main>
      </div>

      <MethodologyModal methodology={data.methodology} stats={data.stats} sources={data.sources}
        open={methodOpen} onClose={() => setMethodOpen(false)} />
    </div>
  )
}

// ── 모바일 상단바 ──────────────────────────────────────────
function MobileNav({ view, onView, scrapCount, dates, dateIndex, onDate, origin, onOrigin, originCounts, category, onCategory, catCounts, total, onOpenMethod }) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      {/* 메뉴 탭 */}
      <div className="mb-2.5 grid grid-cols-3 gap-1.5">
        {MENU.map((m) => (
          <button key={m.key} onClick={() => onView(m.key)}
            className={`rounded-xl px-2 py-2 text-sm font-bold ${view === m.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {m.icon} {m.label}{m.key === 'scrap' && scrapCount > 0 ? ` ${scrapCount}` : ''}
          </button>
        ))}
      </div>

      {view === 'news' && (
        <>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {['국내', '해외'].map((o) => (
                <button key={o} onClick={() => { onOrigin(o); onCategory('전체') }}
                  className={`rounded-xl border px-2 py-1.5 text-sm font-bold ${origin === o ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                  {o === '국내' ? '🇰🇷' : '🌏'} {o} <span className="text-xs opacity-60">{originCounts[o] || 0}</span>
                </button>
              ))}
            </div>
            <div className="ml-2 flex items-center gap-0.5 text-sm">
              <button onClick={() => onDate(dateIndex - 1)} disabled={dateIndex <= 0} className="px-1.5 disabled:opacity-30">◀</button>
              <span className="whitespace-nowrap text-xs font-semibold">{prettyDate(dates[dateIndex])}</span>
              <button onClick={() => onDate(dateIndex + 1)} disabled={dateIndex >= dates.length - 1} className="px-1.5 disabled:opacity-30">▶</button>
            </div>
          </div>
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
            <Chip label="전체" count={total} active={category === '전체'} onClick={() => onCategory('전체')} />
            {Object.keys(CAT_META).filter((c) => catCounts[c]).map((c) => (
              <Chip key={c} label={c} count={catCounts[c]} active={category === c} onClick={() => onCategory(c)} />
            ))}
            <button onClick={onOpenMethod} className="ml-1 whitespace-nowrap rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">📋 기준</button>
          </div>
        </>
      )}
    </div>
  )
}

function Chip({ label, count, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
      {label} <span className="text-xs opacity-60">{count}</span>
    </button>
  )
}

function Center({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-slate-500">{children}</div>
}
