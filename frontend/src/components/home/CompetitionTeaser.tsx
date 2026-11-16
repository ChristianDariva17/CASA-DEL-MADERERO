import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IMG } from '../../content/images'
import { sizedImage } from '../ui/image'

/** Large teaser for the woodcutting competition ("Un escenario…" on the reference). */
export function CompetitionTeaser() {
  return (
    <section className="container-page py-12">
      <div className="grid overflow-hidden bg-forest text-white md:grid-cols-[1.4fr_1fr]">
        <img
          src={sizedImage(IMG.logsCut, 900, 420)}
          alt="Troncos cortados durante la competencia"
          loading="lazy"
          className="h-64 w-full object-cover md:h-[420px]"
        />
        <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
          <h2 className="font-display text-3xl font-extrabold uppercase leading-tight">
            Un escenario nacional para los mejores hacheros del país
          </h2>
          <p className="text-sm leading-relaxed text-white/85">
            La Copa Casa Maderero de Hacheros vuelve a Pucallpa el 12 y 13 de diciembre de 2026. Dos días de
            competencia con equipos regionales y atletas individuales en disciplinas de hacha y sierra. Sigue la
            transmisión en directo y vive cada momento.
          </p>
          <Link
            to="/experiencia/copa-de-hacheros"
            className="inline-flex w-fit items-center gap-1 bg-brand px-5 py-3 text-sm font-bold text-ink hover:bg-brand-dark"
          >
            Mira la transmisión en vivo <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
