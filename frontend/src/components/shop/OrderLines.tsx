import { Link } from 'react-router-dom'
import type { Order } from '../../api/types'
import { formatPrice } from '../ui/format'

/** The lines of an order, as copied when it was placed. */
export function OrderLines({ order, linkProducts = true }: { order: Order; linkProducts?: boolean }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b-2 border-ink text-xs uppercase">
        <tr>
          <th className="py-2">Producto</th>
          <th className="py-2 text-center">Cant.</th>
          <th className="hidden py-2 text-right sm:table-cell">Precio</th>
          <th className="py-2 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {order.items.map((item) => (
          <tr key={item.id}>
            <td className="py-3 pr-3">
              {linkProducts ? (
                <Link to={`/producto/${item.productSlug}`} className="font-bold hover:text-brand">
                  {item.productName}
                </Link>
              ) : (
                <span className="font-bold">{item.productName}</span>
              )}
              {item.variantLabel && <span className="block">{item.variantLabel}</span>}
              <span className="block text-xs text-muted">Ref. {item.reference}</span>
            </td>
            <td className="py-3 text-center">{item.quantity}</td>
            <td className="hidden py-3 text-right sm:table-cell">{formatPrice(item.unitPrice)}</td>
            <td className="py-3 text-right font-bold">{formatPrice(item.lineTotal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-ink font-bold">
          <td colSpan={2} className="py-3">
            Total
          </td>
          <td className="hidden sm:table-cell" />
          <td className="py-3 text-right">{formatPrice(order.total)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
