import { ArrowDown } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Article } from '../api/types'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { sizedImage } from '../components/ui/image'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'
import { NotFoundPage } from './NotFoundPage'

const SECTION_PARENT: Record<Article['kind'], { label: string; to: string }> = {
  guide: { label: 'Consejos y Tutoriales', to: '/consejos' },
  news: { label: 'Noticias', to: '/noticias' },
}

/** dd.mm.yyyy, as on the reference article pages. */
const shortDate = (iso: string) => iso.split('-').reverse().join('.')

/** "/articulos/:slug": long-form article with a ↓ table of contents. */
export function ArticlePage() {
  const { slug = '' } = useParams()
  const { data: article, loading, error } = useApi(() => api.article(slug), [slug])

  if (error && 'status' in error && error.status === 404) return <NotFoundPage />
  if (!article) {
    return (
      <div className="container-page py-16">
        <StateMessage loading={loading} error={error} />
      </div>
    )
  }

  return (
    <article>
      <Breadcrumbs items={[SECTION_PARENT[article.kind], { label: article.title }]} />
      <div className="container-page max-w-[1000px] pb-16 lg:px-4">
        <PageTitle className="mt-6">{article.title}</PageTitle>
        {(article.lead || article.excerpt) && (
          <p className="mt-10 max-w-3xl text-2xl font-light italic leading-relaxed md:text-[28px]">
            {article.lead || article.excerpt}
          </p>
        )}
        <time dateTime={article.publishedAt} className="mt-10 block text-sm">
          {shortDate(article.publishedAt)}
        </time>
        {article.imageUrl && (
          <img
            src={sizedImage(article.imageUrl, 1000, 560)}
            alt=""
            className="mt-6 h-72 w-full object-cover md:h-[560px]"
          />
        )}

        {article.sections.length > 0 && (
          <nav aria-label="Contenido del artículo" className="mt-8 border-b border-line pb-6">
            <ul className="space-y-4">
              {article.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex items-center gap-4 text-sm font-bold hover:text-brand">
                    <ArrowDown className="h-4 w-4" aria-hidden="true" /> {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="max-w-3xl">
          {article.sections.length === 0 && <p className="mt-10 leading-relaxed">{article.body}</p>}
          {article.sections.map((section) => (
            <section key={section.id} id={section.id} className="mt-12 scroll-mt-48">
              <h2 className="font-display text-2xl font-extrabold uppercase md:text-[28px]">{section.title}</h2>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-6 list-disc space-y-2 pl-8 text-sm leading-relaxed">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-6 text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
