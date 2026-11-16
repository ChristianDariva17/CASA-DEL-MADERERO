import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../../api/types'
import { HOME_BY_ROLE, useAuth } from '../../hooks/authContext'

/**
 * Route guard for signed-in areas. It only improves navigation: the API
 * enforces every permission on its own.
 */
export function RequireAuth({ role }: { role?: UserRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="py-16 text-center text-muted">Cargando…</p>
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/ingresar?next=${next}`} replace />
  }
  if (role && user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  return <Outlet />
}
