import { BatteryCharging } from 'lucide-react'
import { ArrowLink } from '../ui/ArrowLink'
import { Photo } from '../ui/Photo'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1733286125300-b4c5563295ad'

export function BatteryBanner() {
  return (
    <section className="bg-ink text-white">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">
            Tecnología de batería
          </h2>
          <p className="max-w-md text-white/80">
            Herramientas potentes, silenciosas y sin emisiones. Un solo sistema de baterías para toda tu
            gama de equipos de jardinería y trabajo forestal.
          </p>
          <div className="flex flex-wrap gap-4">
            <ArrowLink to="/busqueda?q=bater%C3%ADa" variant="button">
              Todos los productos a batería
            </ArrowLink>
          </div>
        </div>
        <div className="relative h-72 overflow-hidden border-b-8 border-brand md:h-80">
          <Photo
            src={BANNER_IMAGE}
            alt="Jardinero trabajando con un soplador en un patio"
            width={640}
            height={320}
            fallback={
              <span className="flex h-full items-center justify-center">
                <BatteryCharging aria-hidden="true" strokeWidth={1} className="h-48 w-48 text-brand" />
              </span>
            }
          />
        </div>
      </div>
    </section>
  )
}
