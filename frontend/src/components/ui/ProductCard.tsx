import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../api/types'
import { formatPrice, POWER_LABELS } from './format'
import { ProductVisual } from './ProductVisual'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex h-full flex-col bg-white shadow-[0_0_0_1px_#d9d9d9] transition-shadow hover:shadow-[0_0_0_2px_#2b2b2b]">
      {product.isNew && (
        <span className="absolute left-0 top-4 z-10 bg-brand px-3 py-1 font-display text-sm font-bold uppercase text-white">
          Nuevo
        </span>
      )}
      <ProductVisual
        icon={product.category.icon}
        imageUrl={product.imageUrl}
        label={`${product.name}, ${product.category.name}`}
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {product.category.name} · {POWER_LABELS[product.powerSource]}
        </p>
        <h3 className="font-display text-2xl font-extrabold uppercase">{product.name}</h3>
        <p className="flex-1 text-sm text-muted">{product.summary}</p>
        <p className="text-lg font-bold">{formatPrice(product.price)}</p>
        <Link
          to={`/producto/${product.slug}`}
          className="mt-2 inline-flex items-center gap-1 font-bold after:absolute after:inset-0 group-hover:text-brand"
        >
          Ver detalles <span className="sr-only">sobre {product.name}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
