import { ChevronUp } from 'lucide-react'
import { api } from '../api/client'
import type { CategoryKind } from '../api/types'
import { CategoryTiles } from '../components/catalog/CategoryTiles'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'

const TITLES: Record<CategoryKind, string> = {
  machine: 'Máquinas y herramientas',
  accessory: 'Accesorios',
}

/** "/productos" and "/accesorios": grid of every category of one kind. */
export function CatalogOverviewPage({ kind }: { kind: CategoryKind }) {
  const { data, loading, error } = useApi(() => api.categories(kind), [kind])
  const other = useApi(() => api.categories(kind === 'machine' ? 'accessory' : 'machine'), [kind])

  return (
    <>
      <Breadcrumbs items={[{ label: TITLES[kind] }]} />
      <div className="container-page pb-16">
        <PageTitle className="mb-12 mt-6 px-2">{TITLES[kind]}</PageTitle>
        <StateMessage loading={loading} error={error} empty={data?.length === 0} />
        {data && (
          <>
            <CategoryTiles categories={data} />
            <div className="mt-10 flex flex-col items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-wide">
                {data.length} de {data.length} categorías
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex flex-col items-center gap-1 text-sm font-bold hover:text-brand"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                  <ChevronUp className="h-4 w-4" />
                </span>
                Volver al principio
              </button>
            </div>
          </>
        )}

        {other.data && other.data.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-extrabold uppercase">
              {kind === 'machine' ? 'Accesorios' : 'Máquinas y herramientas'}
            </h2>
            <CategoryTiles categories={other.data.slice(0, 3)} variant="row" />
          </section>
        )}
      </div>
    </>
  )
}
