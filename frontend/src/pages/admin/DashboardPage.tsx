import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/client'
import type { OrderStatus } from '../../api/types'
import { formatPrice } from '../../components/ui/format'
import { formatDateTime, ORDER_STATUS_LABELS } from '../../components/ui/orderStatus'
import { StateMessage } from '../../components/ui/StateMessage'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useApi } from '../../hooks/useApi'

const STATUS_ORDER: OrderStatus[] = ['pending_payment', 'paid', 'shipped', 'delivered', 'payment_failed', 'cancelled']

/** "/admin": key numbers and the latest orders. */
export function DashboardPage() {
  const { data, loading, error } = useApi(() => adminApi.summary(), [])

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Resumen</h1>
      <StateMessage loading={loading} error={error} />
      {data && (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Ventas cobradas" value={formatPrice(data.revenue)} highlight />
            <Stat label="Pedidos por enviar" value={data.ordersByStatus.paid} to="/admin/pedidos?estado=paid" />
            <Stat label="Clientes registrados" value={data.customers} to="/admin/clientes" />
            <Stat label="Productos en catálogo" value={data.products} to="/admin/productos" />
          </dl>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-bold">Últimos pedidos</h2>
                <Link to="/admin/pedidos" className="flex items-center gap-1 text-sm font-bold hover:text-brand">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              {data.recentOrders.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">Todavía no hay pedidos.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentOrders.map((order) => (
                    <li key={order.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-sm sm:grid-cols-[1fr_auto_auto]">
                      <span>
                        <span className="font-bold">{order.code}</span>
                        <span className="block text-xs text-muted">
                          {order.fullName} · {formatDateTime(order.createdAt)}
                        </span>
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="font-bold sm:text-right">{formatPrice(order.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-fit border border-line bg-white">
              <h2 className="border-b border-line px-5 py-4 font-bold">Pedidos por estado</h2>
              <ul className="divide-y divide-line text-sm">
                {STATUS_ORDER.map((status) => (
                  <li key={status}>
                    <Link
                      to={`/admin/pedidos?estado=${status}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface"
                    >
                      {ORDER_STATUS_LABELS[status]}
                      <span className="font-bold">{data.ordersByStatus[status]}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/admin/reclamos" className="flex items-center justify-between px-5 py-3 hover:bg-surface">
                    Reclamos y quejas
                    <span className="font-bold">{data.complaints}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

interface StatProps {
  label: string
  value: React.ReactNode
  to?: string
  highlight?: boolean
}

function Stat({ label, value, to, highlight }: StatProps) {
  const body = (
    <>
      <dt className="text-sm">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-extrabold">{value}</dd>
    </>
  )
  const className = `block border p-5 ${highlight ? 'border-brand bg-brand' : 'border-line bg-white'}`
  return to ? (
    <div>
      <Link to={to} className={`${className} hover:border-ink`}>
        {body}
      </Link>
    </div>
  ) : (
    <div className={className}>{body}</div>
  )
}
