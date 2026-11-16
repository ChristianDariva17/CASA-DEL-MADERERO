import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { formatPrice, POWER_LABELS } from '../components/ui/format'
import { PageTitle } from '../components/ui/PageTitle'
import { ProductVisual } from '../components/ui/ProductVisual'
import { StateMessage } from '../components/ui/StateMessage'
import { useCompare } from '../hooks/compareContext'
import { useApi } from '../hooks/useApi'

/** "/comparar": side-by-side table of the products picked with "Comparar". */
export function ComparePage() {
  const { items, remove } = useCompare()
  const slugs = items.map((i) => i.slug)
  const { data, loading, error } = useApi(
    () => Promise.all(slugs.map((slug) => api.product(slug))),
    [slugs.join(',')],
  )

  const products = (data ?? []).filter((p) => slugs.includes(p.slug))
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))]
  const rows: { label: string; values: string[] }[] = [
    { label: 'Precio', values: products.map((p) => formatPrice(p.price)) },
    { label: 'Categoría', values: products.map((p) => p.category.name) },
    { label: 'Accionamiento', values: products.map((p) => POWER_LABELS[p.powerSource]) },
    ...specKeys.map((key) => ({ label: key, values: products.map((p) => p.specs[key] ?? '—') })),
  ]

  return (
    <>
      <Breadcrumbs items={[{ label: 'Comparar productos' }]} />
      <div className="container-page pb-16">
        <PageTitle className="mb-10 mt-6">Comparar productos</PageTitle>
        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p>Aún no has seleccionado productos. Marca «Comparar» en hasta 3 productos.</p>
            <ArrowLink to="/productos" variant="button">
              Ver productos
            </ArrowLink>
          </div>
        ) : (
          <>
            <StateMessage loading={loading} error={error} />
            {products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-48" />
                      {products.map((p) => (
                        <th key={p.slug} className="p-3 align-top font-normal">
                          <div className="relative border border-line">
                            <button
                              type="button"
                              onClick={() => remove(p.slug)}
                              aria-label={`Quitar ${p.name}`}
                              className="absolute right-2 top-2 z-10 rounded-full bg-white p-1 shadow hover:text-brand"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <ProductVisual size="sm" icon={p.category.icon} imageUrl={p.imageUrl} label={p.name} />
                            <Link
                              to={`/producto/${p.slug}`}
                              className="block p-3 text-left font-display text-xl font-extrabold uppercase hover:text-brand"
                            >
                              {p.name}
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-[#ececec]' : ''}>
                        <th scope="row" className="border-r border-ink px-4 py-3 text-left font-semibold">
                          {row.label}
                        </th>
                        {row.values.map((value, j) => (
                          <td key={products[j].slug} className="px-4 py-3">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
