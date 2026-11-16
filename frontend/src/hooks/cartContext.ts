import { createContext, useContext } from 'react'

export const MAX_UNITS = 20

export interface CartItem {
  productId: number
  variantId?: number
  slug: string
  name: string
  variantLabel?: string
  reference: string
  imageUrl: string | null
  /** Price shown when added; the server recalculates it at checkout. */
  unitPrice: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

/** A product with a different variant is a different cart line. */
export const cartKey = (item: Pick<CartItem, 'productId' | 'variantId'>) => `${item.productId}:${item.variantId ?? ''}`

export const CartContext = createContext<CartState | null>(null)

export function useCart(): CartState {
  const state = useContext(CartContext)
  if (!state) throw new Error('useCart must be used inside <CartProvider>')
  return state
}
