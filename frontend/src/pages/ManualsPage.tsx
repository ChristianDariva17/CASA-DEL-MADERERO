import { ChevronDown, ChevronUp, FileText, Info, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { TileRow } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { IMG } from '../content/images'
import { useApi } from '../hooks/useApi'

/** "/manuales": manual search by product name plus usage notes. */
export function ManualsPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q')?.trim() ?? ''
  const [term, setTerm] = useState(q)
  const [notesOpen, setNotesOpen] = useState(true)
  const results = useApi(() => (q ? api.products({ q }) : Promise.resolve(null)), [q])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setParams(term.trim() ? { q: term.trim() } : {})
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Información y servicios', to: '/informacion-y-servicios' }, { label: 'Manuales de instrucciones' }]} />
      <div className="container-page">
        <PageTitle className="mb-10 mt-6 px-2">Encuentra los manuales de usuario</PageTitle>
        <div className="max-w-3xl space-y-5 text-sm">
          <p>Aquí puedes consultar los manuales de instrucciones de Casa Maderero y descargarlos en formato PDF.</p>
          <p>Busca por el nombre del producto, por ejemplo «CM 250», o por su referencia.</p>
        </div>

        <form onSubmit={submit} role="search" className="mt-8 flex max-w-md border border-ink">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="p. ej. CM 250"
            aria-label="Buscar manual"
            className="flex-1 px-4 py-2.5 text-sm outline-none"
          />
          <button type="submit" aria-label="Buscar" className="px-3 hover:text-brand">
            <Search className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-3 flex items-center gap-2 text-sm font-bold">
          <Info className="h-4 w-4" aria-hidden="true" /> La referencia figura en la placa de tu máquina y en su página de producto.
        </p>

        {q && (
          <div className="mt-8 max-w-3xl">
            <StateMessage
              loading={results.loading}
              error={results.error}
              empty={results.data?.length === 0}
              emptyText={`No encontramos manuales para «${q}».`}
            />
            <ul className="divide-y divide-line border-y border-line">
              {results.data?.map((product) => (
                <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <Link to={`/producto/${product.slug}`} className="font-bold hover:text-brand">
                    {product.name} <span className="font-normal text-muted">· Ref. {product.reference}</span>
                  </Link>
                  <span className="flex items-center gap-2 text-muted">
                    <FileText className="h-4 w-4" /> Manual de instrucciones (E/ES) · disponible en tu distribuidor
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 max-w-3xl border-b border-line">
          <button
            type="button"
            onClick={() => setNotesOpen(!notesOpen)}
            aria-expanded={notesOpen}
            className="flex w-full items-center justify-between px-4 py-4 text-sm font-bold"
          >
            Tenga en cuenta la siguiente información.
            {notesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {notesOpen && (
            <ul className="list-disc space-y-2 px-4 pb-6 pl-12 text-sm leading-relaxed">
              <li>Actualizamos los manuales continuamente; la versión en línea puede diferir de la que acompañó a tu producto.</li>
              <li>El manual en línea tiene fines orientativos, en particular en la sección «Precauciones de seguridad».</li>
              <li>
                Si no encuentras un manual adecuado, contacta con tu{' '}
                <Link to="/distribuidores" className="underline">distribuidor</Link> o con{' '}
                <Link to="/contacto" className="underline">nosotros</Link>.
              </li>
              <li>El idioma del documento aparece entre paréntesis, por ejemplo (E/ES) = español.</li>
            </ul>
          )}
        </div>
      </div>

      <TileRow
        title="Servicios de los distribuidores Casa Maderero"
        tiles={[
          { title: 'Asesoramiento experto y servicio en tu tienda especialista', to: '/distribuidores', image: IMG.gardenShed },
          { title: 'Reparación y mantenimiento en tu tienda especialista', to: '/distribuidores', image: IMG.brushCutter },
        ]}
      />
    </>
  )
}
