import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { ProductListing } from '../components/catalog/ProductListing'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { useApi } from '../hooks/useApi'

/** "/busqueda?q=": search results with filters, or a search box when empty. */
export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''
  const [term, setTerm] = useState(q)
  const categories = useApi(() => api.categories(), [])
  const count = useApi(() => (q ? api.products({ q }) : Promise.resolve([])), [q])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (term.trim()) setParams({ q: term.trim() })
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Búsqueda' }]} />
      <div className="mx-auto max-w-[1440px] px-4 lg:px-5">
        <PageTitle className="mb-8 mt-8">
          {q ? `Resultados de la búsqueda "${q}" (${count.data?.length ?? '…'})` : 'Buscar productos'}
        </PageTitle>
        <form onSubmit={submit} role="search" className="mb-10 flex max-w-xl border border-ink">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ej.: motosierra, batería, CM 250"
            aria-label="Buscar productos"
            className="flex-1 px-4 py-2.5 outline-none"
          />
          <button type="submit" aria-label="Buscar" className="px-4 hover:text-brand">
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
      {q && (
        <div className="mx-auto max-w-[1440px]">
          <ProductListing key={q} search={q} categoryOptions={categories.data ?? []} />
        </div>
      )}
    </>
  )
}
