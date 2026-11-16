import { TreePine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { formatDate } from '../ui/format'
import { Photo } from '../ui/Photo'
import { SectionHeading } from '../ui/SectionHeading'
import { StateMessage } from '../ui/StateMessage'
import { HorizontalScroller } from './HorizontalScroller'

const TONES = ['bg-[#3b4a2f]', 'bg-[#2c3d4a]', 'bg-[#5b3a1c]', 'bg-[#4b5a3a]']

export function GuidesCarousel() {
  const { data, loading, error } = useApi(() => api.articles('guide'), [])

  return (
    <section id="buenas-practicas" className="container-page py-16">
      <SectionHeading className="mb-8">Consejos de profesionales</SectionHeading>
      <StateMessage loading={loading} error={error} empty={data?.length === 0} />
      {data && (
        <HorizontalScroller label="Artículos de buenas prácticas">
          <li className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[31.5%]">
            <div className="flex h-full flex-col justify-between gap-6 bg-ink p-6 text-white">
              <div>
                <h3 className="font-display text-2xl font-extrabold uppercase">Buenas prácticas</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  En este espacio te damos una amplia perspectiva sobre las mejores prácticas para el uso profesional:
                  gestión de baterías, mantenimiento y seguridad en el trabajo.
                </p>
              </div>
              <Link to="/consejos" className="w-fit bg-brand px-5 py-3 text-sm font-bold text-ink hover:bg-brand-dark">
                Buenas prácticas
              </Link>
            </div>
          </li>
          {data.map((article, i) => (
            <li key={article.id} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[31.5%]">
              <article className="group relative h-full border border-line">
                <div className={`h-48 overflow-hidden ${TONES[i % TONES.length]}`}>
                  <Photo
                    src={article.imageUrl}
                    alt=""
                    width={400}
                    height={192}
                    className="transition-transform duration-500 group-hover:scale-105"
                    fallback={
                      <span className="flex h-full items-center justify-center">
                        <TreePine aria-hidden="true" strokeWidth={1} className="h-20 w-20 text-white/70" />
                      </span>
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <time dateTime={article.publishedAt} className="text-xs font-semibold uppercase text-muted">
                    {formatDate(article.publishedAt)}
                  </time>
                  <h3 className="font-display text-xl font-bold leading-tight group-hover:text-brand">
                    <Link to={`/articulos/${article.slug}`} className="after:absolute after:inset-0">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted">{article.excerpt}</p>
                </div>
              </article>
            </li>
          ))}
        </HorizontalScroller>
      )}
    </section>
  )
}
