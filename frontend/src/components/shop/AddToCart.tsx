import { Check, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAX_UNITS, useCart, type CartItem } from '../../hooks/cartContext'
import { inputClass, primaryButton } from '../ui/formStyles'

/** Quantity picker + "Agregar al carrito" for the product page. */
export function AddToCart({ item }: { item: Omit<CartItem, 'quantity'> }) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const submit = () => {
    add(item, quantity)
    setAdded(true)
  }

  return (
    <div className="mt-5">
      <div className="flex gap-3">
        <label className="w-24">
          <span className="sr-only">Cantidad</span>
          <select
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value))
              setAdded(false)
            }}
            className={`${inputClass} h-full cursor-pointer`}
          >
            {Array.from({ length: MAX_UNITS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={submit} className={`${primaryButton} flex-1`}>
          <ShoppingCart className="h-4 w-4" /> Agregar al carrito
        </button>
      </div>
      {added && (
        <p role="status" className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-700" aria-hidden="true" /> Agregado al carrito.
          <Link to="/carrito" className="font-bold underline hover:text-brand">
            Ver carrito
          </Link>
        </p>
      )}
    </div>
  )
}
