import { useState } from 'react'
import { useClients } from '../lib/storage.js'

const todayStr = () => new Date().toISOString().slice(0, 10)

function daysUntilBirthday(mmdd) {
  if (!mmdd) return null
  const now = new Date()
  const [m, d] = mmdd.split('-').map(Number)
  if (!m || !d) return null
  let next = new Date(now.getFullYear(), m - 1, d)
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next = new Date(now.getFullYear() + 1, m - 1, d)
  return Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000)
}
function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.round((new Date(dateStr) - new Date(todayStr())) / 86400000)
}
function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.round((new Date(todayStr()) - new Date(dateStr)) / 86400000)
}

// 고객별 리마인더 뱃지
function reminders(c) {
  const out = []
  const bd = daysUntilBirthday(c.birthday)
  if (bd != null && bd <= 14) out.push({ t: bd === 0 ? '오늘 생일 🎂' : `생일 D-${bd} 🎂`, c: 'bg-rose-100 text-rose-700' })
  const mt = daysUntil(c.maturity)
  if (mt != null && mt >= 0 && mt <= 30) out.push({ t: `만기 D-${mt} ⏰`, c: 'bg-amber-100 text-amber-700' })
  const last = daysSince(c.lastContact)
  if (last == null || last >= 30) out.push({ t: last == null ? '연락 기록 없음 📞' : `${last}일째 미연락 📞`, c: 'bg-sky-100 text-sky-700' })
  return out
}

export default function Clients() {
  const { clients, add, remove, markContacted } = useClients()
  const [form, setForm] = useState({ name: '', phone: '', birthday: '', product: '', maturity: '', memo: '' })
  const [open, setOpen] = useState(false)
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = () => {
    if (!form.name.trim()) return
    add({ ...form, lastContact: '' })
    setForm({ name: '', phone: '', birthday: '', product: '', maturity: '', memo: '' })
    setOpen(false)
  }

  // 리마인더 있는 고객 우선 정렬
  const sorted = [...clients].sort((a, b) => reminders(b).length - reminders(a).length)
  const urgentCount = clients.filter((c) => reminders(c).length > 0).length

  return (
    <div className="px-5 pb-16 pt-4 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {clients.length === 0 ? '고객을 등록하면 생일·만기·미연락을 자동으로 챙겨줍니다.' :
            <>고객 {clients.length}명 · <b className="text-rose-600">챙길 고객 {urgentCount}명</b></>}
        </p>
        <button onClick={() => setOpen((v) => !v)}
          className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          {open ? '닫기' : '+ 고객 등록'}
        </button>
      </div>

      {open && (
        <div className="mb-5 grid gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <Input label="이름 *" value={form.name} onChange={f('name')} placeholder="홍길동" />
          <Input label="연락처" value={form.phone} onChange={f('phone')} placeholder="010-0000-0000" />
          <Input label="생일 (월-일)" value={form.birthday} onChange={f('birthday')} placeholder="03-15" />
          <Input label="가입 상품" value={form.product} onChange={f('product')} placeholder="종합건강보험" />
          <Input label="만기일" type="date" value={form.maturity} onChange={f('maturity')} />
          <Input label="메모" value={form.memo} onChange={f('memo')} placeholder="실손 보강 제안 예정" />
          <div className="sm:col-span-2">
            <button onClick={submit} className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">저장</button>
          </div>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-3 text-5xl">👥</div>
          <p className="font-semibold text-slate-600">등록된 고객이 없습니다</p>
          <p className="mt-1 text-sm text-slate-400">+ 고객 등록으로 시작하세요. (이 기기에만 저장됩니다)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => {
            const rs = reminders(c)
            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-1.5 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    {c.phone && <a href={`tel:${c.phone}`} className="text-xs text-indigo-600">{c.phone}</a>}
                  </div>
                  <button onClick={() => remove(c.id)} className="text-xs text-slate-300 hover:text-rose-500">삭제</button>
                </div>
                {rs.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {rs.map((r) => <span key={r.t} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.c}`}>{r.t}</span>)}
                  </div>
                )}
                <dl className="space-y-0.5 text-xs text-slate-500">
                  {c.product && <div>📋 {c.product}</div>}
                  {c.birthday && <div>🎂 {c.birthday}</div>}
                  {c.maturity && <div>⏰ 만기 {c.maturity}</div>}
                  {c.memo && <div className="text-slate-600">📝 {c.memo}</div>}
                </dl>
                <button onClick={() => markContacted(c.id, todayStr())}
                  className="mt-3 w-full rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                  ✓ 오늘 연락함{c.lastContact ? ` (최근 ${c.lastContact})` : ''}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
    </label>
  )
}
