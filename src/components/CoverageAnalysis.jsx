import { useState } from 'react'

// 설계사 보장분석(증권분석) — 고객 현재 보장을 항목별 입력 → 부족/적정/과잉/누락 진단.
// 권장 범위는 업계에서 통용되는 일반 가이드(고객 상황에 따라 조정).
const ITEMS = [
  { key: 'death', label: '사망보험금', unit: '만원', rec: [10000, 30000], guide: '유족 생활비·부채 대비' },
  { key: 'cancer', label: '암 진단비', unit: '만원', rec: [3000, 5000], guide: '치료비+생활비 공백' },
  { key: 'brain', label: '뇌혈관 진단비', unit: '만원', rec: [2000, 3000], guide: '뇌출혈·뇌경색' },
  { key: 'heart', label: '허혈성심장 진단비', unit: '만원', rec: [2000, 3000], guide: '급성심근경색 등' },
  { key: 'surgery', label: '수술비(종)', unit: '만원', rec: [100, 300], guide: '질병·상해 수술' },
  { key: 'hospital', label: '입원일당', unit: '만원/일', rec: [3, 5], guide: '장기 입원 소득보전' },
  { key: 'disability', label: '후유장해', unit: '만원', rec: [10000, 10000], guide: '상해 후유장해 3%~' },
]

function diagnose(item, v) {
  if (v === '' || v == null) return { s: 'none', label: '미입력', color: 'text-slate-300' }
  const n = Number(v)
  if (n === 0) return { s: 'gap', label: '미가입', color: 'text-rose-600 bg-rose-50' }
  if (n < item.rec[0]) return { s: 'low', label: '부족', color: 'text-amber-600 bg-amber-50' }
  if (n > item.rec[1] * 1.5) return { s: 'over', label: '과잉·중복점검', color: 'text-violet-600 bg-violet-50' }
  return { s: 'ok', label: '적정', color: 'text-emerald-600 bg-emerald-50' }
}

export default function CoverageAnalysis() {
  const [vals, setVals] = useState({})
  const [silson, setSilson] = useState('') // '' | 'y' | 'n'
  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }))

  const rows = ITEMS.map((it) => ({ it, v: vals[it.key], d: diagnose(it, vals[it.key]) }))
  const gaps = rows.filter((r) => r.d.s === 'low' || r.d.s === 'gap')
  const overs = rows.filter((r) => r.d.s === 'over')
  const silsonGap = silson === 'n'

  return (
    <div className="px-5 pb-16 pt-4 lg:px-8">
      <p className="mb-4 text-sm text-slate-500">
        고객이 현재 가입한 보장금액을 항목별로 입력하면 <b>부족·과잉·공백</b>을 진단합니다. 상담·리모델링 제안의 기초 자료로 쓰세요.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* 입력 테이블 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold">보장 항목</th>
                <th className="px-2 py-2.5 text-right font-semibold">현재 가입</th>
                <th className="px-3 py-2.5 text-right font-semibold">권장</th>
                <th className="px-3 py-2.5 text-center font-semibold">진단</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ it, v, d }) => (
                <tr key={it.key}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{it.label}</div>
                    <div className="text-xs text-slate-400">{it.guide}</div>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <input type="number" value={v ?? ''} onChange={(e) => set(it.key, e.target.value)}
                        placeholder="0"
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right tabular-nums outline-none focus:border-indigo-400" />
                      <span className="text-xs text-slate-400">{it.unit}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-slate-400 tabular-nums">
                    {it.rec[0] === it.rec[1] ? `${it.rec[0].toLocaleString()}` : `${it.rec[0].toLocaleString()}~${it.rec[1].toLocaleString()}`}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${d.color}`}>{d.label}</span>
                  </td>
                </tr>
              ))}
              {/* 실손 */}
              <tr className="bg-slate-50/50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-slate-800">실손의료비 <span className="text-rose-500">必</span></div>
                  <div className="text-xs text-slate-400">모든 치료비의 기본 — 미가입 시 최우선</div>
                </td>
                <td className="px-2 py-2.5" colSpan={2}>
                  <div className="flex justify-end gap-1.5">
                    {[['y', '가입'], ['n', '미가입']].map(([k, l]) => (
                      <button key={k} onClick={() => setSilson(k)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${silson === k ? (k === 'y' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>{l}</button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {silson && <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${silson === 'y' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{silson === 'y' ? '적정' : '공백'}</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 진단 요약 */}
        <div className="space-y-3">
          <Summary title="🔴 보장 공백 / 부족 (영업 기회)" empty="입력하면 부족 항목이 표시됩니다." tone="rose"
            items={[...(silsonGap ? ['실손의료비 — 미가입 (최우선 제안)'] : []), ...gaps.map((r) => `${r.it.label} — ${r.d.label}`)]} />
          <Summary title="🟣 과잉 / 중복 점검 (보험료 절약)" empty="과잉 항목 없음." tone="violet"
            items={overs.map((r) => `${r.it.label} — 권장 초과, 중복 가입 점검`)} />
          <div className="rounded-2xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
            💡 <b>상담 팁:</b> 부족 항목은 "이 부분이 비어 있어요" 보강 제안으로, 과잉·중복은 "여기 보험료 아껴서 저기로 옮기자" 리모델링으로 연결하세요.
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        ※ 권장 범위는 일반 가이드이며 고객의 나이·소득·가족력에 따라 조정합니다. 입력값은 저장되지 않습니다.
      </p>
    </div>
  )
}

function Summary({ title, items, empty, tone }) {
  const border = { rose: 'border-rose-100', violet: 'border-violet-100' }[tone]
  return (
    <div className={`rounded-2xl border ${border} bg-white p-4`}>
      <h3 className="mb-2 text-sm font-bold text-slate-800">{title}</h3>
      {items.length === 0
        ? <p className="text-xs text-slate-400">{empty}</p>
        : <ul className="space-y-1 text-sm text-slate-700">{items.map((t) => <li key={t} className="flex gap-1.5"><span>·</span>{t}</li>)}</ul>}
    </div>
  )
}
