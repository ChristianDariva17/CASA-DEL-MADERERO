import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ListingCard } from '../components/catalog/ListingCard'
import { EventsBlock, FeatureBlock, MoreServices, ShowcaseRow, StoreCtaBand } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { sizedImage } from '../components/ui/image'
import { PageTitle } from '../components/ui/PageTitle'
import { StateMessage } from '../components/ui/StateMessage'
import { ProductVisual } from '../components/ui/ProductVisual'
import { IMG } from '../content/images'
import { useApi } from '../hooks/useApi'
import { NotFoundPage } from './NotFoundPage'

/** "/profesional/:sector": sector landing page (forestal, jardinería, batería). */
export function SectorPage() {
  const { sector: slug = '' } = useParams()
  const loaded = useApi(() => api.sector(slug), [slug])
  const sector = loaded.data
  const categories = useApi(() => api.categories(), [])
  const products = useApi(
    () =>
      sector
        ? Promise.all(sector.productSlugs.map((s) => api.product(s).catch(() => null)))
        : Promise.resolve([]),
    [sector],
  )

  if (loaded.error instanceof ApiError && loaded.error.status === 404) return <NotFoundPage />
  if (!sector) {
    return (
      <div className="container-page">
        <StateMessage loading={loaded.loading} error={loaded.error} />
      </div>
    )
  }

  const sectorCategories = sector.categories
    .map((c) => categories.data?.find((cat) => cat.slug === c))
    .filter((c) => c !== undefined)
  const sectorProducts = (products.data ?? []).filter((p) => p !== null)

  return (
    <>
      <Breadcrumbs items={[{ label: 'Área profesional', to: '/profesional' }, { label: sector.title }]} />
      <div className="container-page">
        <PageTitle className="mb-8 mt-6 px-2">{sector.title}</PageTitle>
        <p className="max-w-3xl text-sm leading-relaxed">{sector.intro}</p>
        {sector.imageUrl && (
          <img
            src={sizedImage(sector.imageUrl, 1200, 520)}
            alt=""
            className="mt-10 h-72 w-full object-cover md:h-[520px]"
          />
        )}
      </div>

      <section className="container-page py-14">
        <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">{sector.machinesTitle}</h2>
        <ul className="grid gap-8 sm:grid-cols-3">
          {sectorCategories.map((category) => (
            <li key={category.slug}>
              <Link to={`/productos/${category.slug}`} className="group block">
                <ProductVisual size="sm" icon={category.icon} imageUrl={category.imageUrl} label={category.name} />
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold group-hover:text-brand">
                  Todas las {category.name.toLowerCase()} profesionales <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <StoreCtaBand />
      <EventsBlock image={IMG.forestryMachine} />

      {sectorProducts.length > 0 && (
        <section className="container-page py-12">
          <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">
            {sector.machinesTitle} y accesorios
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sectorProducts.map((product) => (
              <li key={product.id}>
                <ListingCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <FeatureBlock
        heading="Seguridad en el trabajo con Casa Maderero"
        title="Trabajar de forma segura y saludable"
        text="Concedemos gran importancia a la seguridad laboral y a la protección de la salud. Te informamos sobre las medidas de protección más importantes para que tú y tu equipo trabajéis sin preocupaciones."
        link={{ label: 'Ir a todos los temas de seguridad laboral', to: '/articulos/uso-seguro-motoguadana' }}
        image={IMG.arboristCutting}
      />

      <ShowcaseRow
        title="Protégete de la cabeza a los pies"
        items={[
          { title: 'Casco forestal', to: '/producto/casco-forestal', image: IMG.helmet },
          { title: 'Pantalón anticorte', to: '/producto/pantalon-anticorte', image: IMG.lumberjackMist },
          { title: 'Guantes anticorte', to: '/producto/guantes-anticorte', image: IMG.gardenerPruning },
        ]}
        cta={{ label: 'Descubre la ropa de protección', to: '/productos/equipos-de-proteccion' }}
      />

      <MoreServices
        tiles={[
          { title: 'Conocimientos útiles de profesionales para profesionales', to: '/consejos', image: IMG.arboristPruning },
          { title: 'Instrucciones de seguridad', to: '/articulos/uso-seguro-motoguadana', image: IMG.helmet },
          { title: 'Encuentra los manuales de usuario', to: '/manuales', image: IMG.laptop },
          { title: 'Técnica de trabajo y mantenimiento de las máquinas', to: '/articulos/afilado-de-cadenas', image: IMG.chainsawLog },
        ]}
      />
    </>
  )
}
