import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../api/types'
import { CompareCheckbox } from '../ui/CompareCheckbox'
import { formatPrice } from '../ui/format'
import { ProductVisual } from '../ui/ProductVisual'

/** Bordered product card used in category and search listings. */
export function ListingCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex h-full flex-col border border-line bg-white transition-shadow hover:shadow-[0_0_0_1px_#2b2b2b]">
      {product.isNew && (
        <span className="absolute left-0 top-4 z-10 bg-brand px-3 py-1 font-display text-sm font-bold uppercase text-white">
          Nuevo
        </span>
      )}
      <ProductVisual icon={product.category.icon} imageUrl={product.imageUrl} label={product.name} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold">
          <Link to={`/producto/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-muted">{product.category.name}</p>
        <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <CompareCheckbox slug={product.slug} name={product.name} />
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-ink transition-transform group-hover:translate-x-0.5"
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
