import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Casa Maderero, ir al inicio"
      className={`flex items-center justify-center bg-brand px-5 font-display text-white ${className}`}
    >
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-bold tracking-[0.35em]">CASA</span>
        <span className="text-[30px] font-extrabold italic tracking-tight">MADERERO</span>
      </span>
    </Link>
  )
}
