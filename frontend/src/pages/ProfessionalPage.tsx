import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { EventsBlock, FeatureBlock, ShowcaseRow, SplitHero, StoreCtaBand, TileRow, WorldTiles } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { ProductVisual } from '../components/ui/ProductVisual'
import { IMG } from '../content/images'
import { useApi } from '../hooks/useApi'

const FEATURED = ['cortasetos', 'motoguadanas', 'motosierras']

/** "/profesional": Área profesional hub. */
export function ProfessionalPage() {
  const categories = useApi(() => api.categories('machine'), [])
  const featured = FEATURED.map((slug) => categories.data?.find((c) => c.slug === slug)).filter(
    (c) => c !== undefined,
  )

  return (
    <>
      <Breadcrumbs items={[{ label: 'Área profesional' }]} />
      <PageTitle className="container-page mb-8 mt-6 px-2">
        Nuestro sitio web
        <br />
        para profesionales
      </PageTitle>
      <SplitHero
        title="De profesionales. Para profesionales."
        text="Benefíciate ahora de los conocimientos especializados de nuestros expertos, porque mereces asesoramiento y servicio además de máquinas potentes."
        cta={{ label: 'Todos los productos profesionales', to: '/productos' }}
        image={IMG.arboristPruning}
        panelImage={IMG.forestPath}
      />

      <section className="container-page py-12">
        <ul className="grid gap-8 sm:grid-cols-3">
          {featured.map((category) => (
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
        <div className="mt-10 text-center">
          <Link to="/productos" className="inline-block bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black">
            Todos los productos profesionales
          </Link>
        </div>
      </section>

      <TileRow
        title="Todo sobre tu sector"
        tiles={[
          { title: 'Sector forestal', to: '/profesional/forestal', image: IMG.arboristClimbing },
          { title: 'Jardinería y paisajismo', to: '/profesional/jardineria-paisajismo', image: IMG.gardenShed },
          { title: 'Soluciones de batería', to: '/profesional/soluciones-bateria', image: IMG.leafBlower },
        ]}
      />

      <FeatureBlock
        heading="Seguridad en el trabajo con Casa Maderero"
        title="Trabajar de forma segura y saludable"
        text="Concedemos gran importancia a la seguridad laboral y a la protección de la salud. Te informamos sobre las medidas de protección y de seguridad más importantes para que tú y tus empleados podáis trabajar sin preocupaciones."
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

      <StoreCtaBand />
      <EventsBlock image={IMG.logsStack} />
      <WorldTiles
        tiles={[
          { title: 'Información y servicios', to: '/informacion-y-servicios', image: IMG.forestryMachine },
          { title: 'Guías y consejos', to: '/consejos', image: IMG.plantingHands },
        ]}
      />
    </>
  )
}
