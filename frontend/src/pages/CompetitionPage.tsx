import { ArrowDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { sizedImage } from '../components/ui/image'
import { PageTitle } from '../components/ui/PageTitle'
import { IMG } from '../content/images'

const DISCIPLINES = [
  { name: 'Corte horizontal con hacha', tool: 'Hacha', text: 'De pie sobre el tronco, el atleta corta hacia abajo hasta partirlo en dos.' },
  { name: 'Corte vertical con hacha', tool: 'Hacha', text: 'El tronco se fija en vertical y se corta de lado a lado lo más rápido posible.' },
  { name: 'Tronzado con sierra manual', tool: 'Sierra', text: 'Un disco completo cortado con una sierra de un solo hombre de casi dos metros.' },
  { name: 'Motosierra estándar', tool: 'Motosierra', text: 'Dos cortes, uno hacia abajo y otro hacia arriba, con una motosierra de serie.' },
]

const SECTIONS = [
  { id: 'eventos', title: 'Eventos de la Copa Casa Maderero' },
  { id: 'historia', title: 'La historia de la competencia' },
  { id: 'disciplinas', title: 'Las disciplinas' },
]

/** "/experiencia/copa-de-hacheros": competition page with ↓ table of contents. */
export function CompetitionPage() {
  return (
    <article>
      <Breadcrumbs
        items={[
          { label: 'Información y servicios', to: '/informacion-y-servicios' },
          { label: 'Ferias y eventos', to: '/ferias-y-eventos' },
          { label: 'Copa de Hacheros' },
        ]}
      />
      <div className="container-page max-w-[1000px] pb-16 lg:px-4">
        <PageTitle className="mt-6">
          Copa Casa Maderero de Hacheros: la gran fiesta de los deportes de tala
        </PageTitle>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed">
          La Copa Casa Maderero de Hacheros reúne cada año a los mejores hacheros y motosierristas del país. Los
          atletas compiten en categorías regionales y nacional en disciplinas de hacha, sierra manual y motosierra.
        </p>
        <img src={sizedImage(IMG.logsCut, 1000, 560)} alt="" className="mt-8 h-72 w-full object-cover md:h-[560px]" />

        <nav aria-label="Contenido" className="mt-8 border-b border-line pb-6">
          <ul className="space-y-4">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-4 text-sm font-bold hover:text-brand">
                  <ArrowDown className="h-4 w-4" aria-hidden="true" /> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="eventos" className="mt-10 max-w-3xl scroll-mt-48">
          <h2 className="text-xl font-bold">{SECTIONS[0].title}</h2>
          <p className="mt-4 text-sm leading-relaxed">
            Aquí tienes el resumen de todas las fechas: clasificatorias regionales en Cusco, Tarapoto y Huancayo y la
            gran final en Pucallpa el 12 y 13 de diciembre de 2026, con transmisión en directo y resultados al
            finalizar cada jornada.
          </p>
          <Link to="/ferias-y-eventos" className="mt-5 inline-flex items-center gap-1 text-sm font-bold hover:text-brand">
            Todos los eventos y fechas <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        <section id="historia" className="mt-12 max-w-3xl scroll-mt-48">
          <h2 className="text-xl font-bold">{SECTIONS[1].title}</h2>
          <p className="mt-4 text-sm leading-relaxed">
            Los concursos de hacheros nacieron en los campamentos madereros de la selva, donde las cuadrillas medían
            su destreza al final de la jornada. Casa Maderero los convirtió en una competencia nacional con reglas,
            jueces y estrictas medidas de seguridad.
          </p>
          <img src={sizedImage(IMG.treeTrunks, 1000, 480)} alt="" loading="lazy" className="mt-6 h-64 w-full object-cover md:h-[480px]" />
        </section>

        <section id="disciplinas" className="mt-12 scroll-mt-48">
          <h2 className="text-xl font-bold">{SECTIONS[2].title}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {DISCIPLINES.map((d) => (
              <li key={d.name} className="border-t-4 border-brand bg-surface p-5">
                <p className="text-xs font-semibold uppercase text-muted">{d.tool}</p>
                <h3 className="mt-1 font-display text-lg font-extrabold uppercase">{d.name}</h3>
                <p className="mt-2 text-sm">{d.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}
