import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { Category, PowerSource, ProductSort } from '../../api/types'
import { useApi } from '../../hooks/useApi'
import { formatPrice, POWER_LABELS } from '../ui/format'
import { StateMessage } from '../ui/StateMessage'
import { ListingCard } from './ListingCard'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'popular', label: 'Popularidad' },
  { value: 'name', label: 'Nombre' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

const PRICE_LIMITS = [500, 1000, 2000]
const POWER_SOURCES = Object.keys(POWER_LABELS) as PowerSource[]
const FACET_PREFIX = 'f_'

interface ProductListingProps {
  /** Category pages use that category's facets; search pages use generic filters. */
  category?: string
  search?: string
  /** Category options for the "Categoría" filter (search page only). */
  categoryOptions?: Category[]
}

/** Filter sidebar + sort + product grid; every filter lives in the URL. */
export function ProductListing({ category, search, categoryOptions }: ProductListingProps) {
  const [params, setParams] = useSearchParams()
  const sort = (params.get('sort') as ProductSort | null) ?? 'popular'

  // Category facets: f_<key>=a,b
  const selectedFacets: Record<string, string[]> = {}
  for (const [key, value] of params.entries()) {
    if (key.startsWith(FACET_PREFIX) && value) selectedFacets[key.slice(FACET_PREFIX.length)] = value.split(',')
  }
  // Search filters
  const power = (params.get('power')?.split(',') ?? []).filter((p): p is PowerSource =>
    POWER_SOURCES.includes(p as PowerSource),
  )
  const maxPrice = Number(params.get('maxPrice')) || undefined
  const pickedCategory = params.get('cat') ?? undefined

  const facets = useApi(
    () => (category ? api.facets({ category }) : Promise.resolve([])),
    [category],
  )
  const { data, loading, error } = useApi(
    () =>
      category
        ? api.products({ category, sort, facets: selectedFacets })
        : api.products({ category: pickedCategory, q: search, power, maxPrice, sort }),
    [category, pickedCategory, search, power.join(','), maxPrice, sort, JSON.stringify(selectedFacets)],
  )

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const activeFacetCount = Object.values(selectedFacets).reduce((n, v) => n + v.length, 0)
  const clearFacets = () =>
    update(Object.fromEntries(Object.keys(selectedFacets).map((k) => [FACET_PREFIX + k, undefined])))

  return (
    <div className="grid gap-8 px-4 pb-16 lg:grid-cols-[270px_1fr] lg:px-5">
      <aside aria-label="Filtros">
        <div className="mb-5 flex items-center justify-between">
          <p className="flex items-center gap-2 text-2xl font-bold">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" /> Filtro
          </p>
          {activeFacetCount > 0 && (
            <button type="button" onClick={clearFacets} className="flex items-center gap-1 text-sm underline hover:text-brand">
              <X className="h-3.5 w-3.5" /> Borrar ({activeFacetCount})
            </button>
          )}
        </div>

        {category ? (
          facets.data?.map((facet) => {
            const selected = selectedFacets[facet.key] ?? []
            return (
              <FilterGroup key={facet.key} title={facet.label} defaultOpen={selected.length > 0}>
                {facet.options.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={selected.includes(option.value)}
                      onChange={() =>
                        update({ [FACET_PREFIX + facet.key]: toggleIn(selected, option.value).join(',') || undefined })
                      }
                      className="h-4 w-4 accent-[#f37a1f]"
                    />
                    {option.label} ({option.count})
                  </label>
                ))}
              </FilterGroup>
            )
          })
        ) : (
          <>
            <FilterGroup title="Accionamiento" defaultOpen={power.length > 0}>
              {POWER_SOURCES.map((source) => (
                <label key={source} className="flex cursor-pointer items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={power.includes(source)}
                    onChange={() => update({ power: toggleIn(power, source).join(',') || undefined })}
                    className="h-4 w-4 accent-[#f37a1f]"
                  />
                  {POWER_LABELS[source]}
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Precio" defaultOpen={maxPrice !== undefined}>
              {[undefined, ...PRICE_LIMITS].map((limit) => (
                <label key={limit ?? 'all'} className="flex cursor-pointer items-center gap-2 py-1">
                  <input
                    type="radio"
                    name="maxPrice"
                    checked={maxPrice === limit}
                    onChange={() => update({ maxPrice: limit?.toString() })}
                    className="h-4 w-4 accent-[#f37a1f]"
                  />
                  {limit ? `Hasta ${formatPrice(limit)}` : 'Todos los precios'}
                </label>
              ))}
            </FilterGroup>
            {categoryOptions && (
              <FilterGroup title="Categoría" defaultOpen={pickedCategory !== undefined}>
                <select
                  value={pickedCategory ?? ''}
                  onChange={(e) => update({ cat: e.target.value || undefined })}
                  className="w-full border border-ink bg-white px-2 py-2"
                  aria-label="Categoría"
                >
                  <option value="">Todas</option>
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FilterGroup>
            )}
          </>
        )}
      </aside>

      <div>
        <div className="mb-4 flex justify-end">
          <label className="flex flex-col gap-1 text-sm">
            Ordenar:
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === 'popular' ? undefined : e.target.value })}
              className="min-w-[200px] border border-ink bg-white px-2 py-1.5"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <StateMessage
          loading={loading}
          error={error}
          empty={data?.length === 0}
          emptyText="No encontramos productos con estos filtros."
        />
        {data && data.length > 0 && (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((product) => (
                <li key={product.id}>
                  <ListingCard product={product} />
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-wide">
                {data.length} de {data.length} productos
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
      </div>
    </div>
  )
}

function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#9a9a9a]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-2.5 text-sm font-bold"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="pb-3 text-sm">{children}</div>}
    </div>
  )
}
