export default function Header({ date, count }) {
  const pretty = date
    ? new Date(date + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short',
      })
    : ''
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
            📊 보험설계사 데일리뉴스
          </h1>
          <span className="text-sm font-medium text-slate-500">{pretty}</span>
        </div>
        {count != null && (
          <p className="mt-0.5 text-xs text-slate-400">오늘의 큐레이션 {count}건</p>
        )}
      </div>
    </header>
  )
}
