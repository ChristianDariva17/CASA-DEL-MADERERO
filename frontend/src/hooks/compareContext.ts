import { createContext, useContext } from 'react'

export const MAX_COMPARE = 3

export interface CompareItem {
  slug: string
  name: string
}

export interface CompareState {
  items: CompareItem[]
  has: (slug: string) => boolean
  /** Adds or removes a product; returns false when the list is already full. */
  toggle: (item: CompareItem) => boolean
  remove: (slug: string) => void
  clear: () => void
}

export const CompareContext = createContext<CompareState | null>(null)

export function useCompare(): CompareState {
  const state = useContext(CompareContext)
  if (!state) throw new Error('useCompare must be used inside <CompareProvider>')
  return state
}
