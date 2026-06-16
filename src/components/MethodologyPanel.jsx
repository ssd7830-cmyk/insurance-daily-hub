const AXIS_COLOR = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

export default function MethodologyModal({ methodology, stats, sources, open, onClose }) {
  if (!open || !methodology) return null
  const m = methodology
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">📋 이 뉴스, 이렇게 골랐어요</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">✕</button>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-4 gap-2">
            <Stat label="수집" value={stats.collected} />
            <Stat label="보험관련" value={stats.filtered} />
            <Stat label="홍보성 컷" value={stats.cut_promo} tone="rose" />
            <Stat label="게재" value={stats.published} tone="indigo" />
          </div>
        )}

        <Section title="수집 과정">
          <ol className="space-y-1.5">
            {m.pipeline.map((p) => (
              <li key={p.step} className="flex gap-2 text-sm">
                <span className="whitespace-nowrap font-semibold text-indigo-600">{p.step}</span>
                <span className="text-slate-600">{p.desc}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={`점수 기준 (0~100점 · ${m.threshold}점 미만 제외)`}>
          <div className="space-y-2.5">
            {m.axes.map((a, i) => (
              <div key={a.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{a.key}</span>
                  <span className="font-semibold text-slate-400">{a.weight}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${AXIS_COLOR[i]}`} style={{ width: `${a.weight * 2.6}%` }} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="🚫 이런 건 버립니다">
          <div className="flex flex-wrap gap-1.5">
            {m.cut_rules.map((r) => (
              <span key={r} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">{r}</span>
            ))}
          </div>
        </Section>

        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          <p className="mb-1.5">
            <span className="font-semibold text-slate-600">출처 {sources.length}곳 — </span>
            {sources.map((s) => `${s.name}(${s.type})`).join(' · ')}
          </p>
          <p>⚖️ {m.copyright}</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-bold text-slate-700">{title}</h3>
      {children}
    </div>
  )
}

function Stat({ label, value, tone = 'slate' }) {
  const color = { slate: 'text-slate-900', rose: 'text-rose-600', indigo: 'text-indigo-600' }[tone]
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
