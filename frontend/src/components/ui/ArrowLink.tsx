import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ArrowLinkProps {
  to: string
  children: React.ReactNode
  variant?: 'text' | 'button'
}

export function ArrowLink({ to, children, variant = 'text' }: ArrowLinkProps) {
  if (variant === 'button') {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-2 bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark"
      >
        {children}
        <ChevronRight className="h-4 w-4" />
      </Link>
    )
  }
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 font-bold text-ink hover:text-brand"
    >
      {children}
      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
