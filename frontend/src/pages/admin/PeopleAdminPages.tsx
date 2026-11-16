import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { adminApi } from '../../api/client'
import { formatPrice } from '../../components/ui/format'
import { formatDateTime } from '../../components/ui/orderStatus'
import { StateMessage } from '../../components/ui/StateMessage'
import { useApi } from '../../hooks/useApi'

/** "/admin/clientes": registered customers (read-only). */
export function CustomersAdminPage() {
  const { data, loading, error } = useApi(() => adminApi.customers(), [])

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Clientes</h1>
      <StateMessage loading={loading} error={error} empty={data?.length === 0} emptyText="Todavía no hay clientes." />
      {!!data?.length && (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3 text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-bold">{customer.fullName}</td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{formatDateTime(customer.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{customer.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** "/admin/reclamos": entries of the Libro de Reclamaciones (read-only). */
export function ComplaintsAdminPage() {
  const { data, loading, error } = useApi(() => adminApi.complaints(), [])
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-extrabold uppercase">Libro de reclamaciones</h1>
      <StateMessage loading={loading} error={error} empty={data?.length === 0} emptyText="No hay reclamos registrados." />
      {!!data?.length && (
        <ul className="space-y-3">
          {data.map((complaint) => {
            const expanded = open === complaint.id
            return (
              <li key={complaint.id} className="border border-line bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : complaint.id)}
                  aria-expanded={expanded}
                  className="grid w-full items-center gap-2 px-5 py-4 text-left text-sm md:grid-cols-[180px_1fr_auto_auto]"
                >
                  <span className="font-bold">{complaint.code}</span>
                  <span>
                    {complaint.fullName} · {complaint.productOrService}
                  </span>
                  <span className="w-fit bg-surface px-2 py-0.5 text-xs font-bold uppercase">{complaint.kind}</span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {formatDateTime(complaint.createdAt)}
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {expanded && (
                  <dl className="grid gap-4 border-t border-line px-5 py-5 text-sm md:grid-cols-2">
                    <Item label="Documento" value={`${complaint.documentType} ${complaint.documentNumber}`} />
                    <Item label="Contacto" value={`${complaint.email} · ${complaint.phone}`} />
                    <Item label="Dirección" value={complaint.address} />
                    <Item label="Monto reclamado" value={complaint.amount ? formatPrice(complaint.amount) : '—'} />
                    <Item label="Detalle" value={complaint.detail} wide />
                    <Item label="Pedido del consumidor" value={complaint.request} wide />
                  </dl>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Item({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <dt className="font-bold">{label}</dt>
      <dd className="whitespace-pre-line">{value}</dd>
    </div>
  )
}
