import type { OrderStatus } from '../../api/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from './orderStatus'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap px-2 py-0.5 text-xs font-bold ${ORDER_STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
