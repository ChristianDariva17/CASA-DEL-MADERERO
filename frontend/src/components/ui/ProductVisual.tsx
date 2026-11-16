import { CategoryIcon } from './CategoryIcon'
import { Photo } from './Photo'

interface ProductVisualProps {
  icon: string
  label: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { className: 'h-28', width: 320, height: 224 },
  md: { className: 'h-56', width: 480, height: 336 },
  lg: { className: 'h-80 md:h-[460px]', width: 900, height: 700 },
}

/** Product photo with an illustrated fallback when no photo is available. */
export function ProductVisual({ icon, label, imageUrl, size = 'md' }: ProductVisualProps) {
  const { className, width, height } = SIZES[size]

  const fallback = (
    <div
      role="img"
      aria-label={label}
      className="relative flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#ececec_70%)]"
    >
      <span className="absolute bottom-3 h-3 w-1/2 rounded-full bg-black/10 blur-md" />
      <CategoryIcon
        icon={icon}
        strokeWidth={1.25}
        className="relative h-1/2 w-1/2 text-brand drop-shadow-[0_6px_6px_rgba(0,0,0,0.15)]"
      />
    </div>
  )

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <Photo
        src={imageUrl}
        alt={label}
        width={width}
        height={height}
        priority={size === 'lg'}
        className="transition-transform duration-500 group-hover:scale-105"
        fallback={fallback}
      />
    </div>
  )
}
