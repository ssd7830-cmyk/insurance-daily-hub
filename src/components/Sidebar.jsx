import { CAT_META, prettyDate } from '../lib/ui.js'

export const MENU = [
  { key: 'news', icon: '📰', label: '데일리뉴스' },
  { key: 'tools', icon: '🧮', label: '상담 계산기' },
  { key: 'scrap', icon: '⭐', label: '내 스크랩' },
]

function DateNav({ dates, index, onChange }) {
  const date = dates[index]
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">데일리 다이제스트</div>
      <div className="flex items-center justify-between gap-1">
        <button onClick={() => onChange(index - 1)} disabled={index <= 0}
          className="rounded-lg px-2 py-1 text-slate-500 enabled:hover:bg-slate-100 disabled:opacity-30">◀</button>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-900">{prettyDate(date)}</div>
          <div className="text-[11px] text-slate-400">{date}</div>
        </div>
        <button onClick={() => onChange(index + 1)} disabled={index >= dates.length - 1}
          className="rounded-lg px-2 py-1 text-slate-500 enabled:hover:bg-slate-100 disabled:opacity-30">▶</button>
      </div>
    </div>
  )
}

function OriginBtn({ icon, label, count, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
        active ? 'border-indigo-200 bg-indigo-50' : 'border-transparent hover:bg-slate-100'}`}>
      <span className="text-lg">{icon}</span>
      <span className={`flex-1 text-sm font-bold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
    </button>
  )
}

export default function Sidebar({
  view, onView, scrapCount,
  dates, dateIndex, onDate, origin, onOrigin, originCounts,
  category, onCategory, catCounts, total, onOpenMethod, sourceCount,
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 border-r border-slate-200 bg-slate-50/80 p-4">
      <div>
        <div className="text-base font-extrabold tracking-tight text-slate-900">📊 보험설계사</div>
        <div className="text-base font-extrabold tracking-tight text-indigo-600">데일리 허브</div>
      </div>

      {/* 메뉴 */}
      <nav className="space-y-1">
        {MENU.map((m) => (
          <button key={m.key} onClick={() => onView(m.key)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              view === m.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>{m.icon}</span><span className="flex-1 text-left">{m.label}</span>
            {m.key === 'scrap' && scrapCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${view === m.key ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}>{scrapCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* 뉴스일 때만 보이는 컨트롤 */}
      {view === 'news' && (
        <>
          <DateNav dates={dates} index={dateIndex} onChange={onDate} />
          <div className="space-y-1.5">
            <OriginBtn icon="🇰🇷" label="국내뉴스" count={originCounts['국내'] || 0}
              active={origin === '국내'} onClick={() => onOrigin('국내')} />
            <OriginBtn icon="🌏" label="해외뉴스" count={originCounts['해외'] || 0}
              active={origin === '해외'} onClick={() => onOrigin('해외')} />
          </div>
          <div>
            <div className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">카테고리</div>
            <nav className="space-y-0.5">
              <CatRow label="전체" count={total} dot="bg-indigo-500"
                active={category === '전체'} onClick={() => onCategory('전체')} />
              {Object.keys(CAT_META).map((c) => (
                <CatRow key={c} label={c} count={catCounts[c] || 0} dot={CAT_META[c].dot}
                  active={category === c} disabled={!catCounts[c]} onClick={() => onCategory(c)} />
              ))}
            </nav>
          </div>
          <button onClick={onOpenMethod}
            className="w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100">
            📋 이 뉴스, 어떻게 골랐나
          </button>
        </>
      )}

      <p className="mt-auto px-1 text-[11px] text-slate-400">{sourceCount}개 매체 · 매일 자동 큐레이션</p>
    </aside>
  )
}

function CatRow({ label, count, dot, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition disabled:opacity-30 ${
        active ? 'bg-white font-bold text-slate-900 shadow-sm' : 'text-slate-600 enabled:hover:bg-white/70'}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs text-slate-400">{count}</span>
    </button>
  )
}
