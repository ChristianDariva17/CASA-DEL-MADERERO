import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sizedImage } from '../components/ui/image'
import { PageTitle } from '../components/ui/PageTitle'

const FOREST = 'https://images.unsplash.com/photo-1602331668481-af5996f1e2d1'

export function NotFoundPage() {
  return (
    <section className="relative flex min-h-[640px] items-end overflow-hidden pb-20">
      <img src={sizedImage(FOREST, 1600, 900)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="container-page relative">
        <div className="max-w-md bg-white p-8 shadow-xl">
          <PageTitle as="h1" className="[&_h1]:text-2xl">
            ¿Te has perdido?
          </PageTitle>
          <p className="mt-5 text-sm">
            <strong>Error 404 - Lo sentimos, no hemos encontrado la página que buscas.</strong>
            <br />
            Utiliza nuestra búsqueda para encontrar lo que buscas o vuelve a la página de inicio para seguir
            navegando.
          </p>
          <ul className="mt-6 space-y-2 text-sm font-bold">
            <li>
              <Link to="/busqueda" className="inline-flex items-center gap-1 hover:text-brand">
                Ir a la búsqueda <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-brand">
                Ir a la página de inicio <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
