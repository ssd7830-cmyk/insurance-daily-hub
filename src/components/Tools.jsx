import { useState } from 'react'

const won = (n) => Math.round(n).toLocaleString('ko-KR')

// ── 공용 입력 ──────────────────────────────────────────────
function Field({ label, value, onChange, suffix, step = 1, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400">
        <input type="number" value={value} step={step} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-right text-slate-900 outline-none tabular-nums" />
        {suffix && <span className="ml-2 whitespace-nowrap text-sm text-slate-400">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

function Result({ rows, headline }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5 text-white">
      {headline && (
        <div className="mb-3 border-b border-white/10 pb-3">
          <div className="text-sm text-slate-400">{headline.label}</div>
          <div className="text-3xl font-extrabold text-indigo-300">{headline.value}</div>
        </div>
      )}
      <dl className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <dt className="text-slate-400">{r.label}</dt>
            <dd className={`font-semibold tabular-nums ${r.accent ? 'text-amber-300' : 'text-white'}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ── 1) 연금·노후 시뮬레이터 ─────────────────────────────────
function PensionSim() {
  const [age, setAge] = useState(40)
  const [retire, setRetire] = useState(60)
  const [monthly, setMonthly] = useState(50)        // 만원
  const [rate, setRate] = useState(4)               // %
  const [nps, setNps] = useState(90)                // 국민연금 월 만원
  const [until, setUntil] = useState(90)

  const n = Math.max(0, (retire - age) * 12)
  const r = rate / 100 / 12
  const pmt = monthly * 10000
  const fv = r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r)
  const m = Math.max(1, (until - retire) * 12)
  const drawdown = r === 0 ? fv / m : (fv * r) / (1 - Math.pow(1 + r, -m))
  const total = drawdown + nps * 10000

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Field label="현재 나이" value={age} onChange={(v) => setAge(+v)} suffix="세" />
        <Field label="은퇴 나이" value={retire} onChange={(v) => setRetire(+v)} suffix="세" />
        <Field label="월 저축액" value={monthly} onChange={(v) => setMonthly(+v)} suffix="만원" hint="사적연금·저축 합산" />
        <Field label="예상 연수익률" value={rate} onChange={(v) => setRate(+v)} suffix="%" step={0.1} />
        <Field label="국민연금 예상 월수령액" value={nps} onChange={(v) => setNps(+v)} suffix="만원" hint="국민연금공단 예상연금 조회" />
        <Field label="수령 종료 나이" value={until} onChange={(v) => setUntil(+v)} suffix="세" />
      </div>
      <Result
        headline={{ label: `은퇴 후 예상 월소득 (만 ${retire}~${until}세)`, value: `${won(total / 10000)}만원` }}
        rows={[
          { label: `은퇴 시점 적립금 (${retire}세)`, value: `${won(fv / 10000)}만원` },
          { label: '사적연금 월 인출액', value: `${won(drawdown / 10000)}만원` },
          { label: '국민연금', value: `${won(nps)}만원`, accent: true },
          { label: '총 월소득', value: `${won(total / 10000)}만원`, accent: true },
        ]}
      />
    </div>
  )
}

// ── 2) 연금저축·IRP 절세 계산기 ────────────────────────────
function TaxSaver() {
  const [salary, setSalary] = useState(5000)   // 총급여 만원
  const [pension, setPension] = useState(400)  // 연금저축 납입 만원
  const [irp, setIrp] = useState(300)          // IRP 납입 만원

  const lowRate = salary <= 5500               // 총급여 5,500만원 이하 → 16.5%
  const rate = lowRate ? 0.165 : 0.132
  const pensionElig = Math.min(pension, 600)   // 연금저축 한도 600
  const totalElig = Math.min(pensionElig + irp, 900) // 합산 한도 900
  const credit = totalElig * 10000 * rate

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Field label="연간 총급여" value={salary} onChange={(v) => setSalary(+v)} suffix="만원"
          hint={lowRate ? '5,500만원 이하 → 공제율 16.5%' : '5,500만원 초과 → 공제율 13.2%'} />
        <Field label="연금저축 납입액" value={pension} onChange={(v) => setPension(+v)} suffix="만원" hint="공제한도 600만원" />
        <Field label="IRP 추가 납입액" value={irp} onChange={(v) => setIrp(+v)} suffix="만원" hint="연금저축 합산 900만원까지" />
      </div>
      <Result
        headline={{ label: '연말정산 예상 환급액', value: `${won(credit)}원` }}
        rows={[
          { label: '적용 공제율', value: `${(rate * 100).toFixed(1)}%` },
          { label: '공제대상 금액', value: `${won(totalElig)}만원` },
          { label: '한도 초과분', value: `${won(Math.max(0, pension + irp - totalElig))}만원` },
          { label: '돌려받는 세금', value: `${won(credit)}원`, accent: true },
        ]}
      />
    </div>
  )
}

// ── 3) 생명보험 필요보장액 계산기 ──────────────────────────
function CoverageNeed() {
  const [income, setIncome] = useState(4000)   // 연소득 만원
  const [years, setYears] = useState(10)       // 소득 대체 기간
  const [debt, setDebt] = useState(20000)      // 부채 만원
  const [funeral, setFuneral] = useState(2000) // 장례·정리자금 만원
  const [assets, setAssets] = useState(5000)   // 보유자산 만원
  const [current, setCurrent] = useState(10000) // 현재 사망보장 만원

  const need = income * years + debt + funeral - assets
  const gap = need - current

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <Field label="연소득 (가장)" value={income} onChange={(v) => setIncome(+v)} suffix="만원" />
        <Field label="소득 대체 기간" value={years} onChange={(v) => setYears(+v)} suffix="년" hint="유족 생활비 보장 기간" />
        <Field label="부채 (대출 등)" value={debt} onChange={(v) => setDebt(+v)} suffix="만원" />
        <Field label="장례·정리 자금" value={funeral} onChange={(v) => setFuneral(+v)} suffix="만원" />
        <Field label="보유 자산" value={assets} onChange={(v) => setAssets(+v)} suffix="만원" hint="예금·부동산 등" />
        <Field label="현재 사망보장액" value={current} onChange={(v) => setCurrent(+v)} suffix="만원" />
      </div>
      <Result
        headline={{ label: '추가로 필요한 사망보장액', value: gap > 0 ? `${won(gap)}만원` : '충분 ✓' }}
        rows={[
          { label: '필요 보장액 합계', value: `${won(Math.max(0, need))}만원` },
          { label: '현재 보장액', value: `${won(current)}만원` },
          { label: gap > 0 ? '보장 공백' : '여유', value: `${won(Math.abs(gap))}만원`, accent: true },
        ]}
      />
    </div>
  )
}

const TABS = [
  { key: 'pension', label: '연금·노후 시뮬레이터', icon: '🏖️', el: PensionSim,
    desc: '저축·국민연금으로 은퇴 후 월소득을 추정합니다. 노후설계 클로징 도구.' },
  { key: 'tax', label: '연금저축·IRP 절세', icon: '💸', el: TaxSaver,
    desc: '연금저축·IRP 납입으로 연말정산에 돌려받는 세금을 계산합니다.' },
  { key: 'coverage', label: '필요보장액', icon: '🛡️', el: CoverageNeed,
    desc: '소득·부채·자산으로 적정 사망보장액과 보장 공백을 산출합니다.' },
]

export default function Tools() {
  const [tab, setTab] = useState('pension')
  const Active = TABS.find((t) => t.key === tab)
  return (
    <div className="px-5 pb-16 pt-4 lg:px-8">
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <p className="mb-5 text-sm text-slate-400">{Active.desc}</p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <Active.el />
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        ※ 단순 추정치입니다. 실제 보험료·세액·연금은 상품 약관과 세법에 따라 달라질 수 있습니다.
      </p>
    </div>
  )
}
