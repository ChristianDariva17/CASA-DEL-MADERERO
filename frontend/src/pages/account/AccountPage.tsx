import { ChevronRight, LogOut, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { formatPrice } from '../../components/ui/format'
import { darkButton, outlineButton } from '../../components/ui/formStyles'
import { formatDateTime } from '../../components/ui/orderStatus'
import { PageTitle } from '../../components/ui/PageTitle'
import { StateMessage } from '../../components/ui/StateMessage'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/authContext'
import { useApi } from '../../hooks/useApi'

/** "/mi-cuenta": customer home with profile and order history. */
export function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const orders = useApi(() => api.myOrders(), [])

  const signOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Mi cuenta' }]} />
      <div className="container-page grid gap-10 pb-20 pt-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit bg-surface p-6">
          <p className="text-sm text-muted">Hola,</p>
          <p className="font-display text-2xl font-extrabold uppercase">{user?.fullName}</p>
          <p className="mt-1 break-all text-sm">{user?.email}</p>
          <button type="button" onClick={signOut} className={`${outlineButton} mt-6 w-full bg-white`}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </aside>

        <section>
          <PageTitle className="mb-8">Mis pedidos</PageTitle>
          <StateMessage loading={orders.loading} error={orders.error} />
          {orders.data?.length === 0 && (
            <div className="flex flex-col items-start gap-4 border border-line p-8">
              <Package className="h-10 w-10 text-brand" aria-hidden="true" />
              <p className="font-bold">Todavía no tienes pedidos.</p>
              <Link to="/productos" className={darkButton}>
                Ver productos
              </Link>
            </div>
          )}
          {!!orders.data?.length && (
            <ul className="divide-y divide-line border-y border-line">
              {orders.data.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/mi-cuenta/pedidos/${order.code}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 hover:bg-surface sm:grid-cols-[1fr_auto_auto_auto] sm:px-3"
                  >
                    <span>
                      <span className="font-bold">{order.code}</span>
                      <span className="block text-xs text-muted">
                        {formatDateTime(order.createdAt)} · {order.items.length} producto(s)
                      </span>
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="font-bold sm:text-right">{formatPrice(order.total)}</span>
                    <ChevronRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
