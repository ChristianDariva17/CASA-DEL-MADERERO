import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { ArrowLink } from '../ui/ArrowLink'
import { ProductCard } from '../ui/ProductCard'
import { SectionHeading } from '../ui/SectionHeading'
import { StateMessage } from '../ui/StateMessage'

export function NewProducts() {
  const { data, loading, error } = useApi(() => api.products({ isNew: true }), [])

  return (
    <section className="container-page py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading>Descubre nuestros nuevos productos</SectionHeading>
        <ArrowLink to="/productos">Ver todas las novedades</ArrowLink>
      </div>
      <StateMessage loading={loading} error={error} empty={data?.length === 0} />
      {data && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, 3).map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
