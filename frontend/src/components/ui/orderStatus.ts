import type { OrderStatus } from '../../api/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  payment_failed: 'Pago rechazado',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-900',
  payment_failed: 'bg-red-100 text-red-900',
  paid: 'bg-green-100 text-green-900',
  shipped: 'bg-sky-100 text-sky-900',
  delivered: 'bg-ink text-white',
  cancelled: 'bg-surface text-muted',
}

const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
