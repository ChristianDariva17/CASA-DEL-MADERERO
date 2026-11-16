import { ChevronRight, Gift, ReceiptText, Store } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { sizedImage } from '../components/ui/image'
import { IMG } from '../content/images'
import { NotFoundPage } from './NotFoundPage'

const STEPS = [
  { icon: Store, title: 'Compra', text: 'Adquiere cualquier máquina Casa Maderero en un distribuidor autorizado.' },
  { icon: ReceiptText, title: 'Regístrate', text: 'Envía tu comprobante y tus datos desde el formulario de contacto.' },
  { icon: Gift, title: 'Participa', text: 'Cada máquina registrada es una opción para el sorteo final.' },
]

/** "/campanas/:slug": one-off campaign landing page (only "aniversario" exists). */
export function CampaignPage() {
  const { slug } = useParams()
  if (slug !== 'aniversario') return <NotFoundPage />

  return (
    <>
      <Breadcrumbs items={[{ label: 'Noticias', to: '/noticias' }, { label: 'Gran sorteo de aniversario' }]} />

      <section className="relative overflow-hidden bg-ink text-white">
        <img src={sizedImage(IMG.forestPath, 1600, 600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="container-page relative grid gap-8 py-16 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="w-fit bg-brand px-3 py-1 font-display text-sm font-bold uppercase tracking-widest text-ink">
              Aniversario
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
              Celebramos <span className="text-brand">50 años</span> contigo
            </h1>
            <p className="mt-6 max-w-lg text-white/85">
              Por tus compras de máquinas Casa Maderero participa en el sorteo de una camioneta 4x4 y 10 kits de
              herramientas. Del 1 de noviembre al 31 de diciembre de 2026.
            </p>
          </div>
          <div className="bg-brand p-8 text-ink">
            <p className="font-display text-3xl font-extrabold uppercase">Gran sorteo</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li>1 camioneta 4x4</li>
              <li>10 kits de herramientas y protección</li>
              <li>Sorteo: 15 de enero de 2027</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-10 font-display text-3xl font-extrabold uppercase">¿Cómo participar?</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 border border-line p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand font-display text-2xl font-extrabold">
                {i + 1}
              </span>
              <div>
                <p className="flex items-center gap-2 font-bold">
                  <step.icon className="h-4 w-4" aria-hidden="true" /> {step.title}
                </p>
                <p className="mt-2 text-sm">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/distribuidores" className="inline-flex items-center gap-1 bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black">
            Encuentra tu distribuidor <ChevronRight className="h-4 w-4" />
          </Link>
          <Link to="/contacto" className="inline-flex items-center gap-1 border border-ink px-6 py-3 text-sm font-bold hover:bg-surface">
            Registrar mi compra <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-surface py-12">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-xl font-extrabold uppercase">Bases y condiciones</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-xs leading-relaxed text-muted">
            <li>Promoción válida en Perú del 01/11/2026 al 31/12/2026 para personas mayores de 18 años.</li>
            <li>Participan las compras de máquinas en distribuidores autorizados con comprobante de pago válido.</li>
            <li>El sorteo se realizará ante notario el 15/01/2027 y los ganadores serán contactados por correo.</li>
            <li>Contenido de demostración: reemplazar por las bases legales reales antes de publicar.</li>
          </ul>
        </div>
      </section>
    </>
  )
}
