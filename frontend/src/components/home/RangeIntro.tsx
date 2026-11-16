import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { SectionHeading } from '../ui/SectionHeading'

/** SEO-style paragraph with inline links to every category. */
export function RangeIntro() {
  const { data } = useApi(() => api.categories(), [])
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="border-t border-line">
      <div className="container-page grid gap-8 py-16 md:grid-cols-[1fr_2fr]">
        <SectionHeading>Comprueba tú mismo nuestra variada gama de productos</SectionHeading>
        <div>
        <p id="range-intro" className={`text-lg leading-relaxed text-muted ${expanded ? '' : 'line-clamp-3'}`}>
          En Casa Maderero encontrarás herramientas de calidad para el trabajo forestal, la agricultura y el
          cuidado del jardín. Explora nuestra{' '}
          <Link to="/productos" className="font-semibold text-ink underline hover:text-brand">
            gama de productos
          </Link>
          {data && data.length > 0 && ': '}
          {data?.map((category, i) => (
            <Fragment key={category.id}>
              <Link
                to={`/productos/${category.slug}`}
                className="font-semibold text-ink underline hover:text-brand"
              >
                {category.name.toLowerCase()}
              </Link>
              {i < data.length - 2 ? ', ' : i === data.length - 2 ? ' y ' : ''}
            </Fragment>
          ))}
          . Todos nuestros equipos cuentan con garantía y servicio técnico en nuestra red de distribuidores.
          Muchos productos están disponibles con distintos tipos de accionamiento: combustión, eléctrico y batería.
          Además de las máquinas, encontrarás accesorios, lubricantes y equipos de protección individual.
        </p>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="range-intro"
          className="mt-3 text-sm font-bold underline hover:text-brand"
        >
          {expanded ? 'Leer menos' : 'Leer más'}
        </button>
        </div>
      </div>
    </section>
  )
}
