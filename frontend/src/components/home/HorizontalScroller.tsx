import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

interface HorizontalScrollerProps {
  children: React.ReactNode
  label: string
}

/** Horizontally scrolling row with round prev/next controls. */
export function HorizontalScroller({ children, label }: HorizontalScrollerProps) {
  const track = useRef<HTMLUListElement>(null)

  const scroll = (direction: 1 | -1) => {
    const el = track.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <ul
        ref={track}
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </ul>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Mover elementos hacia la izquierda"
        className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-white shadow hover:bg-brand md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Mover elementos hacia la derecha"
        className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-white shadow hover:bg-brand md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
