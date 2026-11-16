import { BookOpen, Fuel, HardHat, Store, type LucideIcon } from 'lucide-react'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { ArrowLink } from '../ui/ArrowLink'
import { Photo } from '../ui/Photo'
import { StateMessage } from '../ui/StateMessage'

const TILES: { icon: LucideIcon; tone: string; cta: string; to: string }[] = [
  { icon: BookOpen, tone: 'bg-[#3b4a2f]', cta: 'Conoce todo nuestro catálogo aquí', to: '/productos' },
  { icon: Store, tone: 'bg-[#5b3a1c]', cta: 'Visita el listado de distribuidores', to: '/distribuidores' },
  { icon: HardHat, tone: 'bg-[#2c3d4a]', cta: 'Para más consejos, haz click aquí', to: '/consejos' },
  { icon: Fuel, tone: 'bg-[#4a2f2f]', cta: 'Conoce más sobre Aceite Mix', to: '/productos/lubricantes' },
]

export function NewsGrid() {
  const { data, loading, error } = useApi(() => api.articles('news'), [])

  return (
    <section id="destacados" className="bg-surface py-12">
      <div className="container-page">
        <StateMessage loading={loading} error={error} empty={data?.length === 0} />
        {data && (
          <ul className="grid gap-6 md:grid-cols-2">
            {data.slice(0, 4).map((article, i) => {
              const tile = TILES[i % TILES.length]
              const Icon = tile.icon
              return (
                <li key={article.id} className="flex flex-col bg-white">
                  <div className={`group relative h-60 overflow-hidden ${tile.tone}`}>
                    <Photo
                      src={article.imageUrl}
                      alt=""
                      width={600}
                      height={240}
                      className="transition-transform duration-500 group-hover:scale-105"
                      fallback={
                        <span className="flex h-full items-center justify-center">
                          <Icon aria-hidden="true" strokeWidth={1} className="h-24 w-24 text-white/80" />
                        </span>
                      }
                    />
                    <span className="absolute bottom-0 left-0 h-1.5 w-24 bg-brand" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="font-display text-2xl font-extrabold uppercase leading-tight">{article.title}</h3>
                    <p className="flex-1 text-muted">{article.excerpt}</p>
                    <ArrowLink to={tile.to}>{tile.cta}</ArrowLink>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
