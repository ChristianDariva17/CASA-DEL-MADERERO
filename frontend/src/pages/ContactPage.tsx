import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { sizedImage } from '../components/ui/image'
import { PageTitle } from '../components/ui/PageTitle'
import { IMG } from '../content/images'

/** "/contacto": e-mail and phone channels. */
export function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Información y servicios', to: '/informacion-y-servicios' }, { label: 'Contacto' }]} />
      <div className="container-page pb-20">
        <PageTitle className="mb-10 mt-6 px-2">Contacto Casa Maderero</PageTitle>
        <p className="font-bold">No dude en ponerse en contacto con nosotros si tiene alguna pregunta.</p>

        <section className="mt-10 grid items-start gap-5 md:grid-cols-[320px_1fr]">
          <img src={sizedImage(IMG.laptop, 640, 480)} alt="" className="h-60 w-full object-cover" />
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase">Correo electrónico</h2>
            <p className="mt-6 text-sm">¿Tiene preguntas, quiere hacer algún comentario, sugerencia o crítica? Escríbanos.</p>
            <ul className="mt-8 space-y-6 text-sm font-bold underline">
              <li>
                <a href="mailto:ventas@casamaderero.pe">ventas@casamaderero.pe</a>
              </li>
              <li>
                <a href="mailto:servicio@casamaderero.pe">servicio@casamaderero.pe</a>
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16 grid items-start gap-5 md:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase">Llámanos</h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed">
              Nuestro servicio de atención al cliente estará encantado de responder a cualquier pregunta que pueda
              tener sobre la página web de Casa Maderero o sobre nuestra gama de productos.
            </p>
            <p className="mt-6 text-sm">
              Tel: <a href="tel:+5114001200" className="hover:text-brand">01 400 1200</a>
            </p>
            <p className="mt-1 text-sm text-muted">Lunes a viernes de 8:00 a 18:00 h · Sábados de 9:00 a 13:00 h</p>
          </div>
          <img src={sizedImage(IMG.gardenerPruning, 640, 480)} alt="" className="h-60 w-full object-cover" />
        </section>
      </div>
    </>
  )
}
