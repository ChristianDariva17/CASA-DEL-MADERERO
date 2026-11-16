import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { FeatureBlock, TileRow } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { formatDate } from '../components/ui/format'
import { PageTitle } from '../components/ui/PageTitle'
import { Photo } from '../components/ui/Photo'
import { StateMessage } from '../components/ui/StateMessage'
import { IMG } from '../content/images'
import { useApi } from '../hooks/useApi'

/** "/consejos": Consejos y Tutoriales hub with every guide article. */
export function TipsPage() {
  const { data, loading, error } = useApi(() => api.articles('guide'), [])

  return (
    <>
      <Breadcrumbs items={[{ label: 'Consejos y Tutoriales' }]} />
      <div className="container-page">
        <PageTitle className="mb-6 mt-6 px-2">Consejos y Tutoriales</PageTitle>
        <p className="max-w-2xl px-2 text-lg italic text-muted">
          Conocimientos útiles de profesionales para profesionales: mantenimiento, seguridad y buenas prácticas.
        </p>
      </div>

      <section className="container-page py-12">
        <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">Buenas prácticas</h2>
        <StateMessage loading={loading} error={error} empty={data?.length === 0} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((article) => (
            <li key={article.id}>
              <Link to={`/articulos/${article.slug}`} className="group block h-full border border-line">
                <span className="block h-48 overflow-hidden bg-forest">
                  <Photo
                    src={article.imageUrl}
                    alt=""
                    width={400}
                    height={192}
                    className="transition-transform duration-500 group-hover:scale-105"
                    fallback={<span />}
                  />
                </span>
                <span className="flex flex-col gap-2 p-5">
                  <time dateTime={article.publishedAt} className="text-xs uppercase text-muted">
                    {formatDate(article.publishedAt)}
                  </time>
                  <span className="font-display text-xl font-bold leading-tight group-hover:text-brand">
                    {article.title}
                  </span>
                  <span className="text-sm text-muted">{article.excerpt}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold">
                    Leer más <ChevronRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TileRow
        title="Mantenimiento de máquinas"
        tiles={[
          { title: 'Consejos sobre motosierras', to: '/articulos/afilado-de-cadenas', image: IMG.chainsawLog },
          { title: 'Consejos sobre motoguadañas', to: '/articulos/uso-seguro-motoguadana', image: IMG.brushCutter },
          { title: 'Mantenimiento de las baterías', to: '/articulos/gestion-energetica', image: IMG.leafBlower },
        ]}
      />

      <FeatureBlock
        title="Mezcla de combustible"
        text="La proporción correcta de aceite y gasolina prolonga la vida del motor de dos tiempos. Te explicamos cómo prepararla y almacenarla."
        link={{ label: 'Conoce más sobre Aceite Mix', to: '/articulos/mezcla-lista' }}
        image={IMG.logsCut}
        reverse
      />
    </>
  )
}
