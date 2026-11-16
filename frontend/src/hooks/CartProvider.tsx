import { useEffect, useMemo, useState } from 'react'
import { CartContext, cartKey, MAX_UNITS, type CartItem, type CartState } from './cartContext'

const STORAGE_KEY = 'cm.cart'

const clamp = (quantity: number) => Math.min(MAX_UNITS, Math.max(1, Math.floor(quantity) || 1))

function load(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter(
          (i): i is CartItem =>
            typeof i?.productId === 'number' && typeof i?.name === 'string' && typeof i?.quantity === 'number',
        )
      : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable: the cart lasts until reload.
    }
  }, [items])

  const value = useMemo<CartState>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0),
      add: (item, quantity = 1) =>
        setItems((current) => {
          const key = cartKey(item)
          const existing = current.find((i) => cartKey(i) === key)
          if (existing) {
            return current.map((i) => (i === existing ? { ...i, quantity: clamp(i.quantity + quantity) } : i))
          }
          return [...current, { ...item, quantity: clamp(quantity) }]
        }),
      setQuantity: (key, quantity) =>
        setItems((current) => current.map((i) => (cartKey(i) === key ? { ...i, quantity: clamp(quantity) } : i))),
      remove: (key) => setItems((current) => current.filter((i) => cartKey(i) !== key)),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
