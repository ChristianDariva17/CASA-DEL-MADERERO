import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ArrowLink } from '../ui/ArrowLink'
import { sizedImage } from '../ui/image'

interface Slide {
  eyebrow: string
  title: string
  cta: { label: string; to: string }
  background: string
  image: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Temporada 2026',
    title: 'Potencia que nace del bosque',
    cta: { label: 'Descubre los nuevos productos', to: '/productos' },
    background: 'from-[#1f2a1c] via-[#34452b] to-[#6b4a22]',
    image: 'https://images.unsplash.com/photo-1760217280768-92a693be7f1e',
  },
  {
    eyebrow: 'Tecnología de batería',
    title: 'Sin cables, sin mezcla, sin ruido',
    cta: { label: 'Ver productos a batería', to: '/busqueda?q=bater%C3%ADa' },
    background: 'from-[#1d2630] via-[#2c3d4a] to-[#4b5a3a]',
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af',
  },
  {
    eyebrow: 'Red nacional',
    title: 'Un distribuidor experto cerca de ti',
    cta: { label: 'Busca tu distribuidor', to: '/distribuidores' },
    background: 'from-[#3a2412] via-[#5b3a1c] to-[#2b3a22]',
    image: 'https://images.unsplash.com/photo-1602331668481-af5996f1e2d1',
  },
]

const AUTOPLAY_MS = 7000

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [index])

  const slide = SLIDES[index]

  return (
    <section aria-roledescription="carrusel" aria-label="Destacados" className="relative overflow-hidden">
      <div className={`relative h-[440px] bg-gradient-to-br md:h-[460px] ${slide.background} transition-colors duration-700`}>
        <img
          key={slide.image}
          src={sizedImage(slide.image, 1600, 920)}
          alt=""
          className="absolute inset-0 h-full w-full animate-[fadeIn_.8s_ease] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <WoodRings />
        <div className="container-page relative flex h-full flex-col justify-center gap-5 text-white">
          <span className="w-fit bg-brand px-3 py-1 font-display text-sm font-bold uppercase tracking-widest">
            {slide.eyebrow}
          </span>
          <h1 key={slide.title} className="max-w-2xl animate-[fadeUp_.6s_ease] font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-7xl">
            {slide.title}
          </h1>
          <div>
            <ArrowLink to={slide.cta.to} variant="button">
              {slide.cta.label}
            </ArrowLink>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5">
        <div className="container-page flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-brand hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 transition-all ${i === index ? 'w-10 bg-brand' : 'w-5 bg-white/60'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-brand hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

/** Decorative tree-ring lines, echoing the reference hero's line art. */
function WoodRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 600"
      className="pointer-events-none absolute -right-24 top-1/2 h-[700px] w-[700px] -translate-y-1/2 opacity-15"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse
          key={i}
          cx={300 + (i % 3) * 3}
          cy={300 - (i % 2) * 4}
          rx={20 + i * 20}
          ry={18 + i * 19}
          fill="none"
          stroke="#f37a1f"
          strokeWidth={i % 4 === 0 ? 3 : 1.5}
        />
      ))}
    </svg>
  )
}
