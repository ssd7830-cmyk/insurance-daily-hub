// 공용 UI 헬퍼

export const CAT_META = {
  '생명보험': { dot: 'bg-rose-400', soft: 'bg-rose-50 text-rose-700', bar: 'bg-rose-400' },
  '손해보험': { dot: 'bg-sky-400', soft: 'bg-sky-50 text-sky-700', bar: 'bg-sky-400' },
  '건강·실손': { dot: 'bg-emerald-400', soft: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-400' },
  '세금·연금': { dot: 'bg-violet-400', soft: 'bg-violet-50 text-violet-700', bar: 'bg-violet-400' },
  '정책·법규': { dot: 'bg-amber-400', soft: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' },
  '회사동향': { dot: 'bg-slate-400', soft: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
}

export function scoreTier(score) {
  if (score >= 85) return { label: '핵심', ring: 'text-rose-600 bg-rose-50 ring-rose-200' }
  if (score >= 70) return { label: '주목', ring: 'text-amber-600 bg-amber-50 ring-amber-200' }
  return { label: '참고', ring: 'text-slate-500 bg-slate-50 ring-slate-200' }
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return '방금'
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export function prettyDate(date) {
  if (!date) return ''
  return new Date(date + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}
