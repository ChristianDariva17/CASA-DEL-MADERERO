import { CreditCard, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { FormError } from '../../components/ui/Field'
import { formatPrice } from '../../components/ui/format'
import { darkButton, errorMessage, outlineButton } from '../../components/ui/formStyles'
import { PageTitle } from '../../components/ui/PageTitle'
import { StateMessage } from '../../components/ui/StateMessage'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useApi } from '../../hooks/useApi'

/**
 * "/pago/:code": stand-in for the payment gateway while none is chosen.
 * A real provider replaces this screen with its own checkout page.
 */
export function PaymentPage() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const { data: order, loading, error } = useApi(() => api.myOrder(code), [code])
  const [busy, setBusy] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const pay = async (approved: boolean) => {
    setBusy(true)
    setPayError(null)
    try {
      await api.paySimulated(code, approved)
      navigate(`/mi-cuenta/pedidos/${code}`, { replace: true })
    } catch (err) {
      setPayError(errorMessage(err))
      setBusy(false)
    }
  }

  const payable = order?.status === 'pending_payment' || order?.status === 'payment_failed'

  return (
    <>
      <Breadcrumbs items={[{ label: 'Mi cuenta', to: '/mi-cuenta' }, { label: 'Pago' }]} />
      <div className="container-page max-w-2xl pb-20 pt-6">
        <PageTitle className="mb-8">Pago del pedido</PageTitle>
        {!order ? (
          <StateMessage loading={loading} error={error} />
        ) : (
          <section className="border border-line">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface px-6 py-4">
              <p className="font-bold">Pedido {order.code}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="p-6">
              <p className="text-sm">Total a pagar</p>
              <p className="font-display text-4xl font-extrabold">{formatPrice(order.total)}</p>

              {payable ? (
                <>
                  <div className="mt-6 flex gap-3 border-l-4 border-brand bg-[#fff6ee] px-4 py-3 text-sm">
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                      <strong>Pasarela de pago simulada.</strong> Todavía no hay una pasarela real conectada: elige el
                      resultado del pago para probar el flujo. No se cobra nada.
                    </p>
                  </div>
                  <div className="mt-4">
                    <FormError message={payError} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" disabled={busy} onClick={() => void pay(true)} className={darkButton}>
                      <CreditCard className="h-4 w-4" /> Aprobar pago
                    </button>
                    <button type="button" disabled={busy} onClick={() => void pay(false)} className={outlineButton}>
                      Rechazar pago
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm">Este pedido ya no tiene pagos pendientes.</p>
              )}
              <Link to={`/mi-cuenta/pedidos/${order.code}`} className="mt-6 inline-block text-sm font-bold hover:text-brand">
                Ver detalle del pedido
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
