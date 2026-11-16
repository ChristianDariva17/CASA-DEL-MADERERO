import { useState } from 'react'
import { sizedImage } from './image'

interface PhotoProps {
  src: string | null | undefined
  alt: string
  width: number
  height?: number
  className?: string
  /** Rendered when there is no image or it fails to load. */
  fallback: React.ReactNode
  priority?: boolean
}

export function Photo({ src, alt, width, height, className = '', fallback, priority }: PhotoProps) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <>{fallback}</>

  return (
    <img
      src={sizedImage(src, width, height)}
      srcSet={`${sizedImage(src, width, height)} 1x, ${sizedImage(src, width * 2, height && height * 2)} 2x`}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}
