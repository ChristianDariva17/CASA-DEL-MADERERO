import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { formatPrice } from '../../components/ui/format'
import { primaryButton } from '../../components/ui/formStyles'
import { formatDateTime } from '../../components/ui/orderStatus'
import { OrderLines } from '../../components/shop/OrderLines'
import { PageTitle } from '../../components/ui/PageTitle'
import { StateMessage } from '../../components/ui/StateMessage'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useApi } from '../../hooks/useApi'
import { NotFoundPage } from '../NotFoundPage'

/** "/mi-cuenta/pedidos/:code": one order of the signed-in customer. */
export function OrderPage() {
  const { code = '' } = useParams()
  const { data: order, loading, error } = useApi(() => api.myOrder(code), [code])

  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />

  return (
    <>
      <Breadcrumbs items={[{ label: 'Mi cuenta', to: '/mi-cuenta' }, { label: `Pedido ${code}` }]} />
      <div className="container-page pb-20 pt-6">
        {!order ? (
          <StateMessage loading={loading} error={error} />
        ) : (
          <>
            {order.status === 'paid' && (
              <p className="mb-8 flex items-center gap-3 bg-green-50 px-5 py-4 font-bold text-green-900">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> ¡Gracias por tu compra! Tu pago fue aprobado.
              </p>
            )}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <PageTitle>Pedido {order.code}</PageTitle>
              <StatusBadge status={order.status} />
            </div>
            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <OrderLines order={order} />
              <aside className="h-fit space-y-6 bg-surface p-6 text-sm">
                <div>
                  <p className="font-bold">Fecha</p>
                  <p>{formatDateTime(order.createdAt)}</p>
                </div>
                <div>
                  <p className="font-bold">Entrega</p>
                  <p>{order.fullName}</p>
                  <p>{order.address}</p>
                  <p>
                    {order.city}, {order.region}
                  </p>
                  <p>{order.phone}</p>
                </div>
                <div>
                  <p className="font-bold">Total</p>
                  <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                </div>
                {(order.status === 'pending_payment' || order.status === 'payment_failed') && (
                  <Link to={`/pago/${order.code}`} className={`${primaryButton} w-full`}>
                    {order.status === 'payment_failed' ? 'Reintentar pago' : 'Pagar ahora'}
                  </Link>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  )
}
