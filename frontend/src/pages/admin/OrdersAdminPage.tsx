import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi } from '../../api/client'
import type { Order, OrderStatus } from '../../api/types'
import { OrderLines } from '../../components/shop/OrderLines'
import { FormError } from '../../components/ui/Field'
import { formatPrice } from '../../components/ui/format'
import { errorMessage, inputClass } from '../../components/ui/formStyles'
import { formatDateTime, ORDER_STATUS_LABELS } from '../../components/ui/orderStatus'
import { StateMessage } from '../../components/ui/StateMessage'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useApi } from '../../hooks/useApi'

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

const isStatus = (value: string | null): value is OrderStatus => STATUSES.includes(value as OrderStatus)

/** "/admin/pedidos": all orders, filterable by status, with status changes. */
export function OrdersAdminPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('estado')
  const status = isStatus(raw) ? raw : undefined
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useApi(() => adminApi.orders(status), [status, version])
  const [open, setOpen] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const changeStatus = async (order: Order, next: OrderStatus) => {
    if (next === order.status) return
    if (!window.confirm(`¿Cambiar el pedido ${order.code} a "${ORDER_STATUS_LABELS[next]}"?`)) return
    setUpdateError(null)
    try {
      await adminApi.setOrderStatus(order.id, next)
      setVersion((v) => v + 1)
    } catch (err) {
      setUpdateError(errorMessage(err))
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold uppercase">Pedidos</h1>
        <label className="flex items-center gap-2 text-sm font-bold">
          Estado
          <select
            value={status ?? ''}
            onChange={(e) => setParams(e.target.value ? { estado: e.target.value } : {})}
            className={`${inputClass} w-auto`}
          >
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <FormError message={updateError} />
      <StateMessage
        loading={loading && !data}
        error={error}
        empty={data?.length === 0}
        emptyText="No hay pedidos con este estado."
      />

      {!!data?.length && (
        <ul className="space-y-3">
          {data.map((order) => {
            const expanded = open === order.id
            return (
              <li key={order.id} className="border border-line bg-white">
                <div className="grid items-center gap-3 px-5 py-4 text-sm md:grid-cols-[1.2fr_1fr_auto_auto_auto]">
                  <div>
                    <p className="font-bold">{order.code}</p>
                    <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div>
                    <p>{order.fullName}</p>
                    <p className="break-all text-xs text-muted">{order.email}</p>
                  </div>
                  <p className="font-bold md:text-right">{formatPrice(order.total)}</p>
                  <label className="flex items-center gap-2">
                    <span className="sr-only">Estado del pedido {order.code}</span>
                    <StatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(e) => void changeStatus(order, e.target.value as OrderStatus)}
                      className="border border-line bg-white px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : order.id)}
                    aria-expanded={expanded}
                    className="flex items-center gap-1 font-bold hover:text-brand"
                  >
                    Detalle {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                {expanded && (
                  <div className="grid gap-6 border-t border-line px-5 py-5 lg:grid-cols-[1fr_280px]">
                    <OrderLines order={order} linkProducts={false} />
                    <div className="space-y-1 bg-surface p-4 text-sm">
                      <p className="font-bold">Entrega</p>
                      <p>{order.fullName}</p>
                      <p>Doc.: {order.documentNumber}</p>
                      <p>{order.phone}</p>
                      <p>{order.address}</p>
                      <p>
                        {order.city}, {order.region}
                      </p>
                      <p className="pt-3 font-bold">Pago</p>
                      <p>
                        {order.paymentProvider === 'simulated' ? 'Pasarela simulada' : order.paymentProvider}
                        {order.paidAt && ` · ${formatDateTime(order.paidAt)}`}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
