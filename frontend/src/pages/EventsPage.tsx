import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StoreCtaBand } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { api } from '../api/client'
import type { EventKind } from '../api/types'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { isExternalUrl, isSitePath } from '../components/ui/links'
import { useApi } from '../hooks/useApi'

const KINDS: EventKind[] = ['Feria', 'Demostración', 'Competencia']
const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

function formatRange(start: string, end: string) {
  const a = dateFmt.format(new Date(`${start}T00:00:00`))
  return start === end ? a : `${a} – ${dateFmt.format(new Date(`${end}T00:00:00`))}`
}

/** "/ferias-y-eventos": upcoming fairs, demos and competitions. */
export function EventsPage() {
  const [kind, setKind] = useState<EventKind | 'Todos'>('Todos')
  const all = useApi(() => api.events(), [])
  const events = (all.data ?? []).filter((e) => kind === 'Todos' || e.kind === kind)

  return (
    <>
      <Breadcrumbs items={[{ label: 'Información y servicios', to: '/informacion-y-servicios' }, { label: 'Ferias y eventos' }]} />
      <div className="container-page pb-10">
        <PageTitle className="mb-6 mt-6 px-2">Ferias y eventos</PageTitle>
        <p className="max-w-3xl text-sm leading-relaxed">
          Visítanos en las principales ferias agrícolas y forestales del país, prueba nuestras máquinas en las
          jornadas de demostración y vive la emoción de la Copa Casa Maderero de Hacheros.
        </p>

        <div role="tablist" aria-label="Tipo de evento" className="mt-8 flex flex-wrap border-b border-line">
          {(['Todos', ...KINDS] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={`border-b-4 px-6 py-3 text-sm ${kind === k ? 'border-brand font-bold' : 'border-transparent'}`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <StateMessage
            loading={all.loading}
            error={all.error}
            empty={!!all.data && events.length === 0}
            emptyText="No hay eventos programados de este tipo."
          />
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {events.map((event) => (
            <li key={event.id} className="grid gap-3 py-6 md:grid-cols-[220px_1fr_auto] md:items-center">
              <div className="text-sm">
                <p className="flex items-center gap-2 font-bold">
                  <CalendarDays className="h-4 w-4 text-brand" /> {formatRange(event.startDate, event.endDate)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-muted">
                  <MapPin className="h-4 w-4" /> {event.city}
                </p>
              </div>
              <div>
                <span className="bg-surface px-2 py-0.5 text-xs font-semibold uppercase">{event.kind}</span>
                <h2 className="mt-2 font-display text-xl font-extrabold uppercase">{event.name}</h2>
                <p className="mt-1 text-sm">{event.description}</p>
              </div>
              {event.link && <MoreInfo href={event.link} />}
            </li>
          ))}
        </ul>
      </div>
      <StoreCtaBand />
    </>
  )
}

function MoreInfo({ href }: { href: string }) {
  if (!isSitePath(href) && !isExternalUrl(href)) return null
  const className = 'inline-flex items-center gap-1 text-sm font-bold hover:text-brand'
  const content = (
    <>
      Más información <ChevronRight className="h-4 w-4" />
    </>
  )
  return isSitePath(href) ? (
    <Link to={href} className={className}>
      {content}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  )
}
