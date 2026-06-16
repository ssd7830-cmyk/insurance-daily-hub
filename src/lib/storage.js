import { useCallback, useEffect, useState } from 'react'

const KEY = 'ins-dashboard:scraps'
const CLIENT_KEY = 'ins-dashboard:clients'

function useLocalList(key) {
  const [list, setList] = useState([])
  useEffect(() => {
    try { setList(JSON.parse(localStorage.getItem(key) || '[]')) } catch { setList([]) }
  }, [key])
  const save = useCallback((next) => {
    setList(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  }, [key])
  return [list, save]
}

// 고객 관리 — localStorage 기반(브라우저에만 저장, 서버 전송 없음)
export function useClients() {
  const [clients, save] = useLocalList(CLIENT_KEY)
  const add = useCallback((c) => save([{ id: `${Date.now()}-${Math.round(performance.now())}`, ...c }, ...clients]), [clients, save])
  const remove = useCallback((id) => save(clients.filter((c) => c.id !== id)), [clients, save])
  const markContacted = useCallback((id, today) => save(clients.map((c) => c.id === id ? { ...c, lastContact: today } : c)), [clients, save])
  return { clients, add, remove, markContacted }
}

// 뉴스 스크랩(즐겨찾기) — localStorage 기반. link 를 id 로 사용.
export function useScraps() {
  const [scraps, setScraps] = useState([])

  useEffect(() => {
    try { setScraps(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { setScraps([]) }
  }, [])

  const persist = useCallback((next) => {
    setScraps(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 용량 초과 무시 */ }
  }, [])

  const toggle = useCallback((item) => {
    persist(
      scraps.some((s) => s.link === item.link)
        ? scraps.filter((s) => s.link !== item.link)
        : [{ ...item, scrapped_at: new Date().toISOString() }, ...scraps],
    )
  }, [scraps, persist])

  const isScrapped = useCallback((link) => scraps.some((s) => s.link === link), [scraps])

  return { scraps, toggle, isScrapped }
}
