import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { Photo } from '../components/ui/Photo'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'

/** "/noticias": alternating text / image rows. */
export function NewsPage() {
  const { data, loading, error } = useApi(() => api.articles('news'), [])

  return (
    <>
      <Breadcrumbs items={[{ label: 'Noticias' }]} />
      <div className="container-page pb-16">
        <PageTitle className="mb-10 mt-6 px-2">Noticias</PageTitle>
        <StateMessage loading={loading} error={error} empty={data?.length === 0} />
        <ul className="space-y-8">
          {data?.map((article, i) => {
            const imageFirst = i % 2 === 1
            return (
              <li key={article.id} className="grid items-start gap-6 md:grid-cols-2">
                <div className={`py-4 ${imageFirst ? 'md:order-2' : ''}`}>
                  <h2 className="max-w-sm font-display text-2xl font-extrabold uppercase leading-tight">
                    {article.title}
                  </h2>
                  <p className="mt-6 text-sm leading-relaxed">{article.excerpt}</p>
                  <Link
                    to={`/articulos/${article.slug}`}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-bold hover:text-brand"
                  >
                    Conoce más aquí <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className={`h-72 overflow-hidden bg-forest md:h-[420px] ${imageFirst ? 'md:order-1' : ''}`}>
                  <Photo src={article.imageUrl} alt="" width={600} height={420} fallback={<span />} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
