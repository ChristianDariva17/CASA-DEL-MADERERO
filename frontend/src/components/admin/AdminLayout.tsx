import {
  Briefcase,
  CalendarDays,
  CircleHelp,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareWarning,
  Package,
  Scale,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/authContext'

const NAV = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { to: '/admin/articulos', label: 'Noticias y consejos', icon: FileText },
  { to: '/admin/distribuidores', label: 'Distribuidores', icon: MapPin },
  { to: '/admin/sectores', label: 'Sectores', icon: Briefcase },
  { to: '/admin/eventos', label: 'Ferias y eventos', icon: CalendarDays },
  { to: '/admin/preguntas', label: 'Preguntas frecuentes', icon: CircleHelp },
  { to: '/admin/legales', label: 'Textos legales', icon: Scale },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/reclamos', label: 'Reclamos', icon: MessageSquareWarning },
]

/** Shell of the admin panel: its own header and side navigation, no public chrome. */
export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const signOut = () => {
    logout()
    navigate('/ingresar', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 bg-ink pr-4 text-white">
        <Link to="/admin" className="flex h-full items-center gap-3 font-display uppercase">
          <span className="flex h-full items-center bg-brand px-3 text-lg font-extrabold italic leading-none">
            Casa Maderero
          </span>
          <span className="hidden text-lg font-bold tracking-wide sm:inline">Panel</span>
        </Link>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <span className="hidden md:inline">{user?.fullName}</span>
          <Link to="/" className="flex items-center gap-1 hover:text-brand">
            <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Ver sitio</span>
          </Link>
          <button type="button" onClick={signOut} className="flex items-center gap-1 hover:text-brand">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <nav aria-label="Panel de administración" className="border-b border-line bg-white lg:min-h-[calc(100vh-3.5rem)] lg:border-b-0 lg:border-r">
          <ul className="no-scrollbar flex overflow-x-auto lg:flex-col lg:py-4">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 whitespace-nowrap border-b-4 px-4 py-3 text-sm font-bold lg:border-b-0 lg:border-l-4 ${
                      isActive ? 'border-brand bg-surface' : 'border-transparent hover:bg-surface'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" /> {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="min-w-0 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
