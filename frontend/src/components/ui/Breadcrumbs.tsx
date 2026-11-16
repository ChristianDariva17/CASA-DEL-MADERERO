import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

/** "Página principal > …" trail; the last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Página principal', to: '/' }, ...items]
  return (
    <nav aria-label="Ruta de navegación" className="container-page py-4 text-[13px]">
      <ol className="flex flex-wrap items-center gap-1 text-ink">
        {trail.map((item, i) => {
          const last = i === trail.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-brand hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'font-bold' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
