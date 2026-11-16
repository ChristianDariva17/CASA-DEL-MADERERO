import { Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { ShippingInput } from '../../api/types'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Field, FormError } from '../../components/ui/Field'
import { formatPrice } from '../../components/ui/format'
import { errorMessage, inputClass, primaryButton } from '../../components/ui/formStyles'
import { PageTitle } from '../../components/ui/PageTitle'
import { useAuth } from '../../hooks/authContext'
import { cartKey, useCart } from '../../hooks/cartContext'

const FIELDS: { key: keyof ShippingInput; label: string; autoComplete: string; wide?: boolean; hint?: string }[] = [
  { key: 'fullName', label: 'Nombre de quien recibe', autoComplete: 'name', wide: true },
  { key: 'documentNumber', label: 'DNI / CE / RUC', autoComplete: 'off', hint: 'Para la boleta o factura' },
  { key: 'phone', label: 'Teléfono', autoComplete: 'tel' },
  { key: 'address', label: 'Dirección de entrega', autoComplete: 'street-address', wide: true },
  { key: 'city', label: 'Ciudad / distrito', autoComplete: 'address-level2' },
  { key: 'region', label: 'Región', autoComplete: 'address-level1' },
]

/** "/checkout": shipping data, then the order is created and sent to payment. */
export function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<ShippingInput>({
    fullName: user?.fullName ?? '',
    documentNumber: '',
    phone: '',
    address: '',
    city: '',
    region: 'Lima',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0 && !submitting) return <Navigate to="/carrito" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      })
      clear()
      // The simulated gateway uses one of our routes; a real one returns its own URL.
      if (order.redirectUrl.startsWith('/')) navigate(order.redirectUrl, { replace: true })
      else window.location.assign(order.redirectUrl)
    } catch (err) {
      setError(errorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Carrito', to: '/carrito' }, { label: 'Datos de entrega' }]} />
      <div className="container-page pb-20 pt-6">
        <PageTitle className="mb-8">Datos de entrega</PageTitle>
        <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_360px]" noValidate>
          <div className="grid h-fit gap-5 sm:grid-cols-2">
            {error && (
              <div className="sm:col-span-2">
                <FormError message={error} />
              </div>
            )}
            {FIELDS.map((field) => (
              <Field key={field.key} label={field.label} hint={field.hint} className={field.wide ? 'sm:col-span-2' : ''}>
                {(id) => (
                  <input
                    id={id}
                    autoComplete={field.autoComplete}
                    value={form[field.key]}
                    onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                    className={inputClass}
                  />
                )}
              </Field>
            ))}
            <p className="text-sm text-muted sm:col-span-2">
              Comprando como <strong className="text-ink">{user?.email}</strong>. Te enviaremos la confirmación a este
              correo.
            </p>
          </div>

          <aside className="h-fit border border-line p-6">
            <h2 className="font-display text-xl font-extrabold uppercase">Tu pedido</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((item) => (
                <li key={cartKey(item)} className="flex justify-between gap-4">
                  <span>
                    {item.quantity} × {item.name}
                    {item.variantLabel && <span className="text-muted"> · {item.variantLabel}</span>}
                  </span>
                  <span className="whitespace-nowrap">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-line pt-3 font-bold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </p>
            <button type="submit" disabled={submitting} className={`${primaryButton} mt-6 w-full`}>
              <Lock className="h-4 w-4" /> {submitting ? 'Creando pedido…' : 'Ir a pagar'}
            </button>
            <Link to="/carrito" className="mt-4 block text-center text-sm font-bold hover:text-brand">
              Volver al carrito
            </Link>
          </aside>
        </form>
      </div>
    </>
  )
}
