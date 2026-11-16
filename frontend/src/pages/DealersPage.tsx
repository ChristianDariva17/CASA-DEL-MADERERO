import { Crosshair, MapPin, Phone } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Dealer, DealerService } from '../api/types'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'

const DealerMap = lazy(() => import('../components/dealers/DealerMap').then((m) => ({ default: m.DealerMap })))

const DEBOUNCE_MS = 300
const DISTANCES = [10, 20, 50, 100, 500]

const SERVICE_LABELS: Record<DealerService, string> = {
  venta: 'Venta',
  'servicio-tecnico': 'Servicio técnico',
  repuestos: 'Repuestos',
  alquiler: 'Alquiler',
}

type Origin = { lat: number; lng: number }
type GeoStatus = 'idle' | 'locating' | 'ok' | 'denied'

/** "/distribuidores": dealer locator with filters and Mapa | Listado tabs. */
export function DealersPage() {
  const [params] = useSearchParams()
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState(20)
  const [category, setCategory] = useState(params.get('categoria') ?? '')
  const [service, setService] = useState<DealerService | ''>('')
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [geo, setGeo] = useState<GeoStatus>('idle')
  const [tab, setTab] = useState<'map' | 'list'>('map')

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(term.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [term])

  const categories = useApi(() => api.categories(), [])
  const { data, loading, error } = useApi(
    () =>
      api.dealers({
        q: query || undefined,
        category: category || undefined,
        service: service || undefined,
        lat: origin?.lat,
        lng: origin?.lng,
        radiusKm: origin ? radiusKm : undefined,
      }),
    [query, category, service, origin?.lat, origin?.lng, radiusKm],
  )

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setGeo('denied')
      return
    }
    setGeo('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude })
        setGeo('ok')
      },
      () => setGeo('denied'),
      { timeout: 10000 },
    )
  }

  const field = 'w-full border border-ink bg-white px-3 py-2.5 outline-none focus:border-brand'

  return (
    <>
      <Breadcrumbs items={[{ label: 'Distribuidores autorizados' }]} />
      <div className="container-page">
        <PageTitle className="mb-10 mt-6 px-2">Encuentra tu distribuidor autorizado</PageTitle>
        <div className="grid gap-x-5 gap-y-4 md:grid-cols-[2fr_1fr_1fr]">
          <label className="flex flex-col gap-1.5 text-sm">
            Búscalo aquí
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Ciudad/Región/Tienda"
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Distancia máxima
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              disabled={!origin}
              className={`${field} disabled:opacity-50`}
            >
              {DISTANCES.map((d) => (
                <option key={d} value={d}>
                  {d} km
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Gama de productos
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
              <option value="">Todas las categorías</option>
              {categories.data?.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Servicios
            <select
              value={service}
              onChange={(e) => setService(e.target.value as DealerService | '')}
              className={field}
            >
              <option value="">Todos los servicios</option>
              {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3 text-sm md:col-span-2">
            {origin ? (
              <button
                type="button"
                onClick={() => {
                  setOrigin(null)
                  setGeo('idle')
                }}
                className="border border-ink px-4 py-2.5 font-bold hover:bg-surface"
              >
                Quitar mi ubicación
              </button>
            ) : (
              <button
                type="button"
                onClick={locate}
                disabled={geo === 'locating'}
                className="flex items-center gap-2 border border-ink px-4 py-2.5 font-bold hover:bg-surface disabled:opacity-60"
              >
                <Crosshair className="h-4 w-4" />
                {geo === 'locating' ? 'Ubicando…' : 'Usar mi ubicación'}
              </button>
            )}
            <span className="pb-2.5 text-muted" aria-live="polite">
              {geo === 'denied' && 'No pudimos obtener tu ubicación.'}
              {geo === 'ok' && `Mostrando distribuidores a menos de ${radiusKm} km.`}
            </span>
          </div>
        </div>

        <p className="mt-8">{data ? `${data.length} Resultados de la búsqueda` : ' '}</p>
        <div role="tablist" aria-label="Vista de resultados" className="mt-6 flex border-b border-line">
          {(
            [
              ['map', 'Mapa'],
              ['list', 'Listado'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`border-b-4 px-10 py-3 ${tab === id ? 'border-brand font-bold' : 'border-transparent'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pb-16">
        <div className="container-page">
          <StateMessage
            loading={loading && !data}
            error={error}
            empty={data?.length === 0}
            emptyText="No hay distribuidores con estos criterios."
          />
        </div>
        {data && data.length > 0 && tab === 'map' && (
          <Suspense fallback={<div className="h-[560px] bg-[#e3e2df]" />}>
            <DealerMap dealers={data} />
          </Suspense>
        )}
        {data && data.length > 0 && tab === 'list' && <DealerList dealers={data} />}
      </div>
    </>
  )
}

function DealerList({ dealers }: { dealers: Dealer[] }) {
  return (
    <ul className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dealers.map((dealer) => (
        <li key={dealer.id} className="border-t-4 border-brand bg-white p-6 shadow-[0_0_0_1px_#d9d9d9]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {dealer.region}
            {dealer.distanceKm !== null && ` · ${dealer.distanceKm} km`}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-tight">{dealer.name}</h2>
          <p className="mt-4 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {dealer.address}, {dealer.city}
          </p>
          <a
            href={`tel:${dealer.phone.replace(/\s/g, '')}`}
            className="mt-2 flex items-center gap-2 font-semibold hover:text-brand"
          >
            <Phone className="h-4 w-4 text-brand" /> {dealer.phone}
          </a>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {dealer.services.map((s) => (
              <li key={s} className="bg-surface px-2 py-0.5 text-xs font-semibold">
                {SERVICE_LABELS[s]}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
