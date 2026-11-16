import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { CategoryIcon } from '../ui/CategoryIcon'
import { Photo } from '../ui/Photo'
import { StateMessage } from '../ui/StateMessage'
import { HorizontalScroller } from './HorizontalScroller'

export function CategoryStrip() {
  const { data, loading, error } = useApi(() => api.categories(), [])

  return (
    <section className="bg-surface py-10">
      <div className="container-page">
        <StateMessage loading={loading} error={error} />
        {data && (
          <HorizontalScroller label="Categorías de productos">
            <li className="w-44 shrink-0 snap-start">
              <Link
                to="/productos"
                className="flex h-full flex-col justify-between bg-ink p-4 font-bold text-white hover:bg-brand"
              >
                <span className="flex items-center justify-between">
                  Todos los productos <ChevronRight className="h-4 w-4" />
                </span>
                <span className="font-display text-5xl font-extrabold text-brand">{data.length}+</span>
              </Link>
            </li>
            {data.map((category) => (
              <li key={category.id} className="w-44 shrink-0 snap-start">
                <Link to={`/productos/${category.slug}`} className="group block">
                  <span className="flex items-center justify-between pb-3 text-[15px] font-semibold group-hover:text-brand">
                    {category.name} <ChevronRight className="h-4 w-4" />
                  </span>
                  <span className="block h-28 overflow-hidden bg-white transition-transform group-hover:-translate-y-1">
                    <Photo
                      src={category.imageUrl}
                      alt=""
                      width={176}
                      height={112}
                      fallback={
                        <span className="flex h-full items-center justify-center">
                          <CategoryIcon icon={category.icon} className="h-14 w-14 text-brand" />
                        </span>
                      }
                    />
                  </span>
                </Link>
              </li>
            ))}
          </HorizontalScroller>
        )}
      </div>
    </section>
  )
}
