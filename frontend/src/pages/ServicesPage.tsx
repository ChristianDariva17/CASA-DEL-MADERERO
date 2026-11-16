import { FeatureBlock, TileRow } from '../components/content/blocks'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { PageTitle } from '../components/ui/PageTitle'
import { IMG } from '../content/images'

/** "/informacion-y-servicios": company, dealer services and help hub. */
export function ServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Información y servicios' }]} />
      <div className="container-page">
        <PageTitle className="mb-6 mt-6 px-2">Información y servicios</PageTitle>
        <p className="max-w-2xl px-2 text-lg italic text-muted">
          Todo lo que necesitas antes y después de tu compra: asesoramiento, mantenimiento, manuales y contacto.
        </p>
      </div>

      <TileRow
        title="Servicios de nuestras tiendas especialistas"
        tiles={[
          { title: 'Distribuidores autorizados', to: '/distribuidores', image: IMG.gardenShed },
          { title: 'Asesoramiento experto', to: '/contacto', image: IMG.gardenerPruning },
          { title: 'Mantenimiento y reparación', to: '/articulos/afilado-de-cadenas', image: IMG.chainsawLog },
        ]}
      />

      <TileRow
        title="Ayuda y documentación"
        tiles={[
          { title: 'Manuales de instrucciones', to: '/manuales', image: IMG.laptop },
          { title: 'Preguntas frecuentes', to: '/preguntas-frecuentes', image: IMG.treeTrunks },
          { title: 'Noticias', to: '/noticias', image: IMG.logsStack },
          { title: 'Ferias y eventos', to: '/ferias-y-eventos', image: IMG.forestryMachine },
          { title: 'Guía de tallas', to: '/guia-de-tallas', image: IMG.helmet },
          { title: 'Copa de Hacheros', to: '/experiencia/copa-de-hacheros', image: IMG.logsCut },
        ]}
      />

      <FeatureBlock
        heading="Sobre Casa Maderero"
        title="Herramientas para quienes trabajan la madera"
        text="Desde hace décadas acompañamos a profesionales forestales, agricultores y jardineros en todo el Perú con equipos confiables, repuestos originales y servicio técnico especializado."
        link={{ label: 'Contáctanos', to: '/contacto' }}
        image={IMG.forestryMachine}
      />

      <FeatureBlock
        title="Seguridad"
        text="Instrucciones de seguridad, normas y equipos de protección para trabajar sin riesgos."
        link={{ label: 'Instrucciones de seguridad', to: '/articulos/uso-seguro-motoguadana' }}
        image={IMG.helmet}
        reverse
      />
    </>
  )
}
