import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { CategoryTiles } from '../components/catalog/CategoryTiles'
import { ProductListing } from '../components/catalog/ProductListing'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'
import { NotFoundPage } from './NotFoundPage'

/** "/productos/:category": one category with filters, sort and accessories row. */
export function CategoryPage() {
  const { category: slug = '' } = useParams()
  const { data: category, loading, error } = useApi(() => api.category(slug), [slug])
  const accessories = useApi(() => api.categories('accessory'), [])

  if (error && 'status' in error && error.status === 404) return <NotFoundPage />
  if (!category) {
    return (
      <div className="container-page py-16">
        <StateMessage loading={loading} error={error} />
      </div>
    )
  }

  const isAccessory = category.kind === 'accessory'
  const parent = isAccessory
    ? { label: 'Accesorios', to: '/accesorios' }
    : { label: 'Máquinas y herramientas', to: '/productos' }

  return (
    <>
      <Breadcrumbs items={[parent, { label: category.name }]} />
      <PageTitle className="mx-auto mb-10 mt-8 max-w-[1440px] px-4 lg:px-5">{category.name}</PageTitle>
      <div className="mx-auto max-w-[1440px]">
        <ProductListing key={category.slug} category={category.slug} />
      </div>

      {accessories.data && (
        <section className="mx-auto max-w-[1440px] px-4 pb-20 lg:px-5">
          <h2 className="mb-6 text-lg font-bold">Accesorios</h2>
          <CategoryTiles
            categories={accessories.data.filter((c) => c.slug !== category.slug).slice(0, 3)}
            variant="row"
          />
        </section>
      )}
    </>
  )
}
