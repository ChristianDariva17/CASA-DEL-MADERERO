import { useCallback, useEffect, useMemo, useState } from 'react'
import { CompareContext, MAX_COMPARE, type CompareItem, type CompareState } from './compareContext'

const STORAGE_KEY = 'cm.compare'

function load(): CompareItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed
          .filter((i): i is CompareItem => typeof i?.slug === 'string' && typeof i?.name === 'string')
          .slice(0, MAX_COMPARE)
      : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable (private mode): the selection just won't persist.
    }
  }, [items])

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items])

  const toggle = useCallback(
    (item: CompareItem) => {
      if (items.some((i) => i.slug === item.slug)) {
        setItems(items.filter((i) => i.slug !== item.slug))
        return true
      }
      if (items.length >= MAX_COMPARE) return false
      setItems([...items, item])
      return true
    },
    [items],
  )

  const value = useMemo<CompareState>(
    () => ({
      items,
      has,
      toggle,
      remove: (slug) => setItems((current) => current.filter((i) => i.slug !== slug)),
      clear: () => setItems([]),
    }),
    [items, has, toggle],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
