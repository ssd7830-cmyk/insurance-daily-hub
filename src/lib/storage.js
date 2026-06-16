import { useCallback, useEffect, useState } from 'react'

const KEY = 'ins-dashboard:scraps'

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
