import { X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { MAX_COMPARE, useCompare } from '../../hooks/compareContext'

/** Floating bar listing the products picked with "Comparar". */
export function CompareBar() {
  const { items, remove, clear } = useCompare()
  const { pathname } = useLocation()
  if (items.length === 0 || pathname === '/comparar') return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-brand bg-ink text-white shadow-2xl">
      <div className="container-page flex flex-wrap items-center gap-3 py-3">
        <p className="flex-1 font-bold sm:flex-none">
          Comparar ({items.length}/{MAX_COMPARE})
        </p>
        <ul className="hidden flex-1 flex-wrap gap-2 sm:flex">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center gap-1 bg-white/10 py-1 pl-3 pr-1 text-sm">
              {item.name}
              <button
                type="button"
                onClick={() => remove(item.slug)}
                aria-label={`Quitar ${item.name}`}
                className="p-1 hover:text-brand"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={clear} className="text-sm underline hover:text-brand">
          Limpiar
        </button>
        <Link
          to="/comparar"
          aria-disabled={items.length < 2}
          className={`bg-brand px-5 py-2 font-bold ${items.length < 2 ? 'pointer-events-none opacity-50' : 'hover:bg-brand-dark'}`}
        >
          Comparar ahora
        </Link>
      </div>
    </div>
  )
}
