import { useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { RichText } from '../components/ui/RichText'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'
import { NotFoundPage } from './NotFoundPage'

/** "/legal/:slug": legal texts edited from the admin panel. */
export function LegalPage() {
  const { slug = '' } = useParams()
  const page = useApi(() => api.legalPage(slug), [slug])
  if (page.error instanceof ApiError && page.error.status === 404) return <NotFoundPage />

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Información legal', to: '/legal/informacion-legal' }, { label: page.data?.title ?? '…' }]}
      />
      <div className="container-page pb-20">
        <StateMessage loading={page.loading} error={page.error} />
        {page.data && (
          <>
            <PageTitle className="mb-10 mt-6 px-2">{page.data.title}</PageTitle>
            <RichText text={page.data.body} className="max-w-3xl space-y-6 text-sm leading-relaxed" />
          </>
        )}
      </div>
    </>
  )
}
