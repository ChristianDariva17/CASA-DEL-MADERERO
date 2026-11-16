import { BookOpen, Headset, Store, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const TILES: { icon: LucideIcon; title: string; text: string; to: string }[] = [
  { icon: BookOpen, title: 'Catálogo Casa Maderero', text: 'Toda la gama en un solo lugar.', to: '/productos' },
  { icon: Store, title: 'Busca tu distribuidor autorizado', text: 'Asesoría experta cerca de ti.', to: '/distribuidores' },
  { icon: Headset, title: 'Contacto', text: 'Estamos para ayudarte.', to: '/contacto' },
]

export function ServiceTiles() {
  return (
    <section className="bg-surface py-16">
      <h2 className="container-page mb-8 font-display text-3xl font-extrabold uppercase md:text-4xl">Mundo Casa Maderero</h2>
      <ul className="container-page grid gap-6 md:grid-cols-3">
        {TILES.map(({ icon: Icon, title, text, to }) => (
          <li key={title}>
            <Link to={to} className="group flex items-center gap-5 bg-white p-6 hover:bg-ink hover:text-white">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-brand text-white">
                <Icon aria-hidden="true" className="h-8 w-8" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold uppercase leading-tight">{title}</span>
                <span className="text-sm text-muted group-hover:text-white/70">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
