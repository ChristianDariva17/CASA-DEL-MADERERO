import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IMG } from '../../content/images'
import { sizedImage } from '../ui/image'
import { SectionHeading } from '../ui/SectionHeading'

/** "Casa Maderero actual: noticias y promociones" teaser. */
export function NewsActual() {
  return (
    <section className="container-page py-16">
      <SectionHeading className="mb-8">Casa Maderero actual: noticias y promociones</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/noticias" className="group grid border border-line sm:grid-cols-2">
          <span className="block h-56 overflow-hidden sm:h-full">
            <img src={sizedImage(IMG.treeTrunks, 420, 300)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </span>
          <span className="flex flex-col gap-3 p-6">
            <span className="font-display text-xl font-bold uppercase">Catálogo Casa Maderero</span>
            <span className="text-sm text-muted">
              ¡Conoce nuestro portafolio de productos! Desde maquinaria para el agro y la construcción hasta el
              mantenimiento de áreas verdes.
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold group-hover:text-brand">
              Catálogo Casa Maderero <ChevronRight className="h-4 w-4" />
            </span>
          </span>
        </Link>
        <Link to="/campanas/aniversario" className="group flex flex-col justify-between bg-brand p-8 text-ink">
          <span className="font-display text-3xl font-extrabold uppercase leading-tight">
            Gran sorteo de aniversario
          </span>
          <span className="text-sm">Por tus compras de máquinas Casa Maderero participa en el sorteo de una camioneta y 10 kits de herramientas.</span>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold group-hover:underline">
            Conoce más aquí <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  )
}
