import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sizedImage } from '../ui/image'

export interface LinkTile {
  title: string
  to: string
  image?: string
}

/** Dark text panel next to a wide photo ("De profesionales. Para profesionales."). */
export function SplitHero({
  title,
  text,
  cta,
  image,
  panelImage,
}: {
  title: string
  text: string
  cta: { label: string; to: string }
  image: string
  panelImage?: string
}) {
  return (
    <section className="grid md:grid-cols-[1fr_2.2fr] md:gap-2">
      <div className="relative flex min-h-[320px] items-center overflow-hidden bg-forest p-10 text-white">
        {panelImage && (
          <>
            <img src={sizedImage(panelImage, 600, 600)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative">
          <h2 className="text-xl font-bold">{title}</h2>
          <span aria-hidden="true" className="mt-2 block h-1 w-5 bg-white" />
          <p className="mt-6 text-sm leading-relaxed">{text}</p>
          <Link to={cta.to} className="mt-6 inline-flex items-center gap-1 text-sm font-bold hover:text-brand">
            {cta.label} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <img src={sizedImage(image, 1100, 460)} alt="" className="h-[320px] w-full object-cover md:h-[460px]" />
    </section>
  )
}

/** Row of photo tiles with title + chevron and a bottom border. */
export function TileRow({ title, tiles }: { title?: string; tiles: LinkTile[] }) {
  return (
    <section className="container-page py-12">
      {title && <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">{title}</h2>}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.title}>
            <Link to={tile.to} className="group block">
              <span className="block h-44 overflow-hidden bg-surface">
                {tile.image && (
                  <img
                    src={sizedImage(tile.image, 420, 176)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="flex items-center justify-between border-b border-[#9a9a9a] px-2 py-3 text-sm font-bold group-hover:text-brand">
                {tile.title}
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Large photo beside a heading, paragraph and arrow link; `reverse` puts the text first. */
export function FeatureBlock({
  heading,
  title,
  text,
  link,
  image,
  reverse = false,
  children,
}: {
  heading?: string
  title: string
  text: string
  link?: { label: string; to: string }
  image: string
  reverse?: boolean
  children?: React.ReactNode
}) {
  return (
    <section className="container-page py-10">
      {heading && <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">{heading}</h2>}
      <div className={`grid items-start gap-6 ${reverse ? 'md:grid-cols-[1fr_1.4fr]' : 'md:grid-cols-[1.4fr_1fr]'}`}>
        <img
          src={sizedImage(image, 760, 430)}
          alt=""
          loading="lazy"
          className={`h-72 w-full object-cover md:h-[430px] ${reverse ? 'md:order-2' : ''}`}
        />
        <div>
          <h3 className="font-display text-2xl font-extrabold uppercase">{title}</h3>
          <p className="mt-4 text-sm leading-relaxed">{text}</p>
          {children}
          {link && (
            <Link to={link.to} className="mt-5 inline-flex items-center gap-1 text-sm font-bold hover:text-brand">
              {link.label} <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

/** Three image-on-top links, e.g. "Protégete de la cabeza a los pies". */
export function ShowcaseRow({
  title,
  items,
  cta,
}: {
  title: string
  items: LinkTile[]
  cta?: { label: string; to: string }
}) {
  return (
    <section className="container-page py-12">
      <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">{title}</h2>
      <ul className="grid gap-8 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <Link to={item.to} className="group block">
              <span className="block h-40 overflow-hidden">
                {item.image && (
                  <img
                    src={sizedImage(item.image, 380, 160)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold group-hover:text-brand">
                {item.title} <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-10 text-center">
          <Link to={cta.to} className="inline-block bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black">
            {cta.label}
          </Link>
        </div>
      )}
    </section>
  )
}

/** Gray "Encuentra tu tienda … más cercana" band. */
export function StoreCtaBand() {
  return (
    <section className="container-page py-6">
      <div className="bg-[#d9d9d9] px-6 py-12 text-center">
        <h2 className="mx-auto max-w-md font-display text-2xl font-extrabold uppercase leading-tight">
          Encuentra tu tienda Casa Maderero más cercana
        </h2>
        <Link to="/distribuidores" className="mt-5 inline-flex items-center gap-1 text-sm font-bold hover:text-brand">
          Ir a la búsqueda de tiendas especialistas <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/** "Descubre Casa Maderero en ferias y eventos" block. */
export function EventsBlock({ image }: { image: string }) {
  return (
    <section className="container-page py-12">
      <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">
        Descubre Casa Maderero en ferias y eventos
      </h2>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <img src={sizedImage(image, 640, 360)} alt="" loading="lazy" className="h-64 w-full object-cover" />
        <div>
          <p className="text-sm leading-relaxed">
            ¿Quieres saber más sobre Casa Maderero y nuestros productos? Visítanos en una feria: participamos
            regularmente en ferias agrícolas y forestales de todo el país. Estaremos encantados de hablar contigo
            personalmente. Aquí encontrarás información actual sobre los próximos eventos.
          </p>
          <Link
            to="/ferias-y-eventos"
            className="mt-6 inline-block bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-black"
          >
            Todas las ferias y eventos
          </Link>
        </div>
      </div>
    </section>
  )
}

/** "Más información sobre el mundo Casa Maderero": orange text tile + photo link tiles. */
export function WorldTiles({ tiles }: { tiles: LinkTile[] }) {
  return (
    <section className="container-page py-12">
      <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">
        Más información sobre el mundo Casa Maderero
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        <li className="flex min-h-44 bg-brand p-5">
          <Link to="/experiencia/copa-de-hacheros" className="font-display text-xl font-extrabold uppercase hover:underline">
            Afronta nuevos retos
          </Link>
        </li>
        {tiles.map((tile) => (
          <li key={tile.title}>
            <Link to={tile.to} className="group block">
              <span className="block h-36 overflow-hidden bg-surface">
                {tile.image && (
                  <img src={sizedImage(tile.image, 380, 144)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
              </span>
              <span className="flex items-center justify-between border-b border-[#9a9a9a] px-2 py-3 text-sm font-bold group-hover:text-brand">
                {tile.title} <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Four-column "Más servicios" tiles used at the end of sector pages. */
export function MoreServices({ tiles }: { tiles: LinkTile[] }) {
  return (
    <section className="container-page py-12">
      <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">Más servicios</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.title}>
            <Link to={tile.to} className="group block">
              <span className="block h-28 overflow-hidden bg-surface">
                {tile.image && (
                  <img src={sizedImage(tile.image, 300, 112)} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="flex min-h-16 items-center justify-between gap-2 border-b border-[#9a9a9a] px-2 py-3 text-sm font-bold group-hover:text-brand">
                {tile.title} <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
