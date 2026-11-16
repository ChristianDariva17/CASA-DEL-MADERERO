import { ChevronRight, Mail, MapPin, Menu, Minus, Plus, Search, ShoppingCart, User, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { Category } from '../../api/types'
import { HOME_BY_ROLE, useAuth } from '../../hooks/authContext'
import { useCart } from '../../hooks/cartContext'
import { useApi } from '../../hooks/useApi'
import { CategoryIcon } from '../ui/CategoryIcon'
import { Logo } from '../ui/Logo'

interface MenuLink {
  label: string
  to: string
}

interface MenuSection {
  id: string
  label: string
  links: MenuLink[]
}

const STATIC_SECTIONS: MenuSection[] = [
  {
    id: 'accessories',
    label: 'Accesorios',
    links: [
      { label: 'Todos los accesorios', to: '/accesorios' },
      { label: 'Cadenas y espadas', to: '/productos/cadenas-y-espadas' },
      { label: 'Equipos de protección', to: '/productos/equipos-de-proteccion' },
      { label: 'Lubricantes', to: '/productos/lubricantes' },
    ],
  },
  {
    id: 'pro',
    label: 'Área profesional',
    links: [
      { label: 'Área profesional', to: '/profesional' },
      { label: 'Sector forestal', to: '/profesional/forestal' },
      { label: 'Jardinería y paisajismo', to: '/profesional/jardineria-paisajismo' },
      { label: 'Soluciones de batería', to: '/profesional/soluciones-bateria' },
      { label: 'Seguridad en el trabajo', to: '/articulos/uso-seguro-motoguadana' },
    ],
  },
  {
    id: 'tips',
    label: 'Consejos y Tutoriales',
    links: [
      { label: 'Todos los consejos', to: '/consejos' },
      { label: 'Afilado de cadenas', to: '/articulos/afilado-de-cadenas' },
      { label: 'Mezcla de combustible', to: '/articulos/mezcla-lista' },
      { label: 'Uso seguro de la motoguadaña', to: '/articulos/uso-seguro-motoguadana' },
    ],
  },
  {
    id: 'info',
    label: 'Información y Servicios',
    links: [
      { label: 'Información y Servicios', to: '/informacion-y-servicios' },
      { label: 'Distribuidores autorizados', to: '/distribuidores' },
      { label: 'Noticias', to: '/noticias' },
      { label: 'Ferias y eventos', to: '/ferias-y-eventos' },
      { label: 'Copa de Hacheros', to: '/experiencia/copa-de-hacheros' },
      { label: 'Manuales de instrucciones', to: '/manuales' },
      { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
]

export function Header() {
  const [open, setOpen] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { data: categories } = useApi(() => api.categories('machine'), [])

  // Close every menu when the route changes (state adjusted during render).
  const locationKey = location.pathname + location.search + location.hash
  const [seenLocation, setSeenLocation] = useState(locationKey)
  if (seenLocation !== locationKey) {
    setSeenLocation(locationKey)
    setOpen(null)
    setMobileOpen(false)
    setSearchOpen(false)
  }

  const toggle = (id: string) => setOpen((current) => (current === id ? null : id))

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_#d9d9d9]">
      <Link
        to="/distribuidores"
        className="flex items-center justify-center gap-2 bg-brand py-3 font-display text-base font-bold uppercase tracking-wider text-ink hover:text-white"
      >
        Busca tu distribuidor autorizado <ChevronRight className="h-4 w-4" />
      </Link>

      <div className="hidden border-b border-line bg-surface md:block">
        <div className="container-page flex h-11 items-center justify-between text-[15px] font-semibold">
          <Link to="/distribuidores" className="flex items-center gap-2 hover:text-brand">
            <MapPin className="h-4 w-4" /> Busca tu distribuidor autorizado
          </Link>
          <div className="flex items-center gap-10">
            <AccountLink withLabel />
            <CartLink withLabel />
            <Link to="/contacto" aria-label="Contacto" className="hover:text-brand">
              <Mail className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center gap-2 hover:text-brand"
              aria-expanded={searchOpen}
            >
              <Search className="h-4 w-4" /> Buscar productos
            </button>
          </div>
        </div>
      </div>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}

      <nav aria-label="Menú principal" className="relative">
        <div className="container-page flex h-16 items-stretch">
          <Logo className="h-16 shrink-0" />

          <ul className="hidden flex-1 items-stretch lg:flex">
            <NavButton id="products" label="Productos" open={open} onToggle={toggle} />
            {STATIC_SECTIONS.map((section) => (
              <NavButton key={section.id} id={section.id} label={section.label} open={open} onToggle={toggle} />
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <span className="flex items-center gap-2 p-2 md:hidden">
              <AccountLink />
            </span>
            <span className="flex items-center gap-2 p-2 md:hidden">
              <CartLink />
            </span>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2"
              aria-label="Buscar productos"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <MegaPanel
            sectionId={open}
            categories={categories ?? []}
            onClose={() => setOpen(null)}
          />
        )}

        {mobileOpen && <MobileMenu categories={categories ?? []} />}
      </nav>
    </header>
  )
}

interface NavButtonProps {
  id: string
  label: string
  open: string | null
  onToggle: (id: string) => void
}

function NavButton({ id, label, open, onToggle }: NavButtonProps) {
  const active = open === id
  return (
    <li className="flex flex-1 border-r border-line first:border-l">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={active}
        className={`flex w-full items-center justify-between gap-3 px-4 text-left text-[17px] font-bold leading-tight transition-colors ${
          active ? 'bg-ink text-white' : 'hover:bg-surface'
        }`}
      >
        <span>{label}</span>
        {active ? <Minus className="h-5 w-5 shrink-0" /> : <Plus className="h-5 w-5 shrink-0" />}
      </button>
    </li>
  )
}

interface MegaPanelProps {
  sectionId: string
  categories: Category[]
  onClose: () => void
}

function MegaPanel({ sectionId, categories, onClose }: MegaPanelProps) {
  const section = STATIC_SECTIONS.find((s) => s.id === sectionId)

  return (
    <div className="absolute inset-x-0 top-full hidden border-t-4 border-brand bg-white shadow-xl lg:block">
      <div className="container-page relative py-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:text-brand lg:right-0"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

        {sectionId === 'products' ? (
          <>
            <p className="mb-6 font-display text-2xl font-extrabold uppercase">Productos</p>
            <ul className="grid grid-cols-5 gap-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/productos/${category.slug}`}
                    className="group flex flex-col items-center gap-3 bg-surface p-4 text-center font-semibold hover:bg-ink hover:text-white"
                  >
                    <CategoryIcon icon={category.icon} className="h-10 w-10 text-brand" />
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/productos"
                  className="flex h-full items-center justify-center gap-1 border-2 border-ink p-4 font-bold hover:border-brand hover:text-brand"
                >
                  Todos los productos <ChevronRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </>
        ) : (
          section && (
            <>
              <p className="mb-6 font-display text-2xl font-extrabold uppercase">{section.label}</p>
              <ul className="grid grid-cols-3 gap-x-8 gap-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center justify-between border-b border-line py-3 font-semibold hover:text-brand"
                    >
                      {link.label} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )
        )}
      </div>
    </div>
  )
}

function MobileMenu({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState<string | null>('products')
  const sections: MenuSection[] = [
    {
      id: 'products',
      label: 'Productos',
      links: [
        ...categories.map((c) => ({ label: c.name, to: `/productos/${c.slug}` })),
        { label: 'Todos los productos', to: '/productos' },
      ],
    },
    ...STATIC_SECTIONS,
  ]

  return (
    <div className="max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-line bg-white lg:hidden">
      {sections.map((section) => {
        const isOpen = expanded === section.id
        return (
          <div key={section.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : section.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-4 text-left text-lg font-bold"
            >
              {section.label}
              {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
            {isOpen && (
              <ul className="bg-surface px-4 pb-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="block py-2 font-medium hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** "Ingresar" when signed out; "Mi cuenta" or "Panel" by role when signed in. */
function AccountLink({ withLabel = false }: { withLabel?: boolean }) {
  const { user } = useAuth()
  const to = user ? HOME_BY_ROLE[user.role] : '/ingresar'
  const label = !user ? 'Ingresar' : user.role === 'admin' ? 'Panel' : 'Mi cuenta'
  return (
    <Link to={to} aria-label={withLabel ? undefined : label} className="flex items-center gap-2 hover:text-brand">
      <User className={withLabel ? 'h-4 w-4' : 'h-5 w-5'} /> {withLabel && label}
    </Link>
  )
}

function CartLink({ withLabel = false }: { withLabel?: boolean }) {
  const { count } = useCart()
  return (
    <Link
      to="/carrito"
      aria-label={`Carrito, ${count} producto(s)`}
      className="relative flex items-center gap-2 hover:text-brand"
    >
      <ShoppingCart className={withLabel ? 'h-4 w-4' : 'h-5 w-5'} /> {withLabel && 'Carrito'}
      {count > 0 && (
        <span
          aria-hidden="true"
          className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-ink ${
            withLabel ? '' : 'absolute -right-2 -top-2'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const q = term.trim()
    if (!q) return
    navigate(`/busqueda?q=${encodeURIComponent(q)}`)
    onClose()
  }

  return (
    <form onSubmit={submit} role="search" className="border-b border-line bg-white">
      <div className="container-page flex items-center gap-3 py-3">
        <Search className="h-5 w-5 text-muted" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="¿Qué producto buscas? Ej.: motosierra"
          aria-label="Buscar productos"
          className="flex-1 bg-transparent py-2 text-lg outline-none"
        />
        <button type="submit" className="bg-brand px-5 py-2 font-bold text-white hover:bg-brand-dark">
          Buscar
        </button>
      </div>
    </form>
  )
}
