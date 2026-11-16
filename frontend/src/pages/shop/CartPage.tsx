import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { formatPrice } from '../../components/ui/format'
import { darkButton, primaryButton } from '../../components/ui/formStyles'
import { PageTitle } from '../../components/ui/PageTitle'
import { ProductVisual } from '../../components/ui/ProductVisual'
import { cartKey, MAX_UNITS, useCart } from '../../hooks/cartContext'

/** "/carrito": review lines and quantities before checkout. */
export function CartPage() {
  const { items, count, subtotal, setQuantity, remove } = useCart()

  return (
    <>
      <Breadcrumbs items={[{ label: 'Carrito' }]} />
      <div className="container-page pb-20 pt-6">
        <PageTitle className="mb-8">Carrito</PageTitle>

        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-5 bg-surface p-8">
            <ShoppingCart className="h-10 w-10 text-brand" aria-hidden="true" />
            <p className="text-lg font-bold">Tu carrito está vacío.</p>
            <Link to="/productos" className={darkButton}>
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-line border-y border-line">
              {items.map((item) => {
                const key = cartKey(item)
                return (
                  <li key={key} className="grid grid-cols-[96px_1fr] gap-4 py-5 sm:grid-cols-[120px_1fr_auto]">
                    <Link to={`/producto/${item.slug}`} className="block">
                      <ProductVisual size="sm" icon="tool" imageUrl={item.imageUrl} label={item.name} />
                    </Link>
                    <div>
                      <Link to={`/producto/${item.slug}`} className="font-bold hover:text-brand">
                        {item.name}
                      </Link>
                      {item.variantLabel && <p className="text-sm">{item.variantLabel}</p>}
                      <p className="text-xs text-muted">Ref. {item.reference}</p>
                      <p className="mt-2 text-sm">{formatPrice(item.unitPrice)} c/u</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center border border-line" role="group" aria-label="Cantidad">
                          <button
                            type="button"
                            onClick={() => setQuantity(key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Quitar una unidad"
                            className="p-2 hover:bg-surface disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(key, item.quantity + 1)}
                            disabled={item.quantity >= MAX_UNITS}
                            aria-label="Agregar una unidad"
                            className="p-2 hover:bg-surface disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="flex items-center gap-1 text-sm text-muted hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> Quitar
                        </button>
                      </div>
                    </div>
                    <p className="col-start-2 font-bold sm:col-start-3 sm:text-right">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </li>
                )
              })}
            </ul>

            <aside className="h-fit border border-line p-6">
              <h2 className="font-display text-xl font-extrabold uppercase">Resumen</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Productos ({count})</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Envío</dt>
                  <dd className="text-muted">Se coordina tras el pago</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted">Precios con IGV. Se confirman al crear el pedido.</p>
              <Link to="/checkout" className={`${primaryButton} mt-6 w-full`}>
                Continuar con la compra
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
