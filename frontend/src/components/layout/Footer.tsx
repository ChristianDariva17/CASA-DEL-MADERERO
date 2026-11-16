import { MapPin, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'La Empresa',
    links: [
      { label: 'Sobre nosotros', to: '/informacion-y-servicios' },
      { label: 'Línea de Integridad', to: '/contacto' },
    ],
  },
  {
    title: 'Preguntas frecuentes (FAQs)',
    links: [
      { label: 'Preguntas sobre el portafolio', to: '/preguntas-frecuentes' },
      { label: 'Baterías y equipos eléctricos', to: '/preguntas-frecuentes#baterias' },
      { label: 'Manuales de uso', to: '/manuales' },
    ],
  },
]

const LEGAL = [
  { label: 'Aviso de privacidad y protección de datos', to: '/legal/privacidad' },
  { label: 'Aviso legal', to: '/legal/aviso-legal' },
  { label: 'Cookies', to: '/legal/cookies' },
  { label: 'Información legal', to: '/legal/informacion-legal' },
  { label: 'Libro de Reclamaciones', to: '/libro-de-reclamaciones' },
]

export function Footer() {
  return (
    <footer className="bg-[#ececec] text-ink">
      <div className="container-page grid gap-10 pb-10 pt-16 md:grid-cols-3 md:px-4">
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-5 font-bold">{column.title}</p>
            <ul className="space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-brand hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-5 font-bold">Contacto</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/contacto" className="flex items-center gap-2 hover:text-brand hover:underline">
                <MessagesSquare className="h-4 w-4" aria-hidden="true" /> Contacto
              </Link>
            </li>
            <li>
              <Link to="/distribuidores" className="flex items-center gap-2 hover:text-brand hover:underline">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Encuentra tu distribuidor aquí
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-[#b5b5b5] py-10">
        <div className="flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between md:px-2">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="hover:text-brand hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="max-w-[230px] text-[11px] leading-snug">
            CASA MADERERO S.A.C., Av. Argentina 1450, Cercado de Lima, Lima-Perú
          </p>
        </div>
      </div>
    </footer>
  )
}
