import { useState } from 'react'
import { CAT_META, scoreTier, timeAgo } from '../lib/ui.js'

export default function NewsCard({ item, scrapped, onToggleScrap }) {
  const tier = scoreTier(item.score)
  const cat = CAT_META[item.category] || CAT_META['회사동향']
  const [copied, setCopied] = useState(false)

  const copyMent = () => {
    const text = `[${item.title}]\n${item.why_matters || item.summary || ''}\n원문: ${item.link}`
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute left-0 top-0 h-full w-1 ${cat.bar}`} aria-hidden />
      <div className="flex flex-1 flex-col p-4 pl-5">
        {/* 메타 행 */}
        <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          {item.origin === '해외' && <span title="해외">🌏</span>}
          <span className="font-medium text-slate-600">{item.source}</span>
          <span className="text-slate-300">·</span>
          <span>{timeAgo(item.published)}</span>
          <span className={`ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ring-1 ${tier.ring}`}>
            <span className="tabular-nums">{item.score}</span>
            <span className="text-[10px] font-semibold opacity-70">{tier.label}</span>
          </span>
          {onToggleScrap && (
            <button onClick={() => onToggleScrap(item)} title={scrapped ? '스크랩 해제' : '스크랩'}
              className={`text-base leading-none transition ${scrapped ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>
              {scrapped ? '★' : '☆'}
            </button>
          )}
        </div>

        <h3 className="mb-2 text-[15px] font-bold leading-snug text-slate-900 group-hover:text-indigo-700">
          {item.title}
        </h3>

        {item.summary
          ? <p className="mb-3 text-sm leading-relaxed text-slate-600">{item.summary}</p>
          : <p className="mb-3 text-sm italic text-slate-400">AI 요약 대기 — 원문에서 확인하세요</p>}

        {item.why_matters && (
          <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-900">
            <div className="mb-0.5 flex items-center justify-between">
              <span className="font-semibold">💡 상담 포인트</span>
              <button onClick={copyMent}
                className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-200">
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            </div>
            {item.why_matters}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          {item.tag
            ? <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.soft}`}>#{item.tag}</span>
            : <span />}
          <a href={item.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
            원문 <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}
