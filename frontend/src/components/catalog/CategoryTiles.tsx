import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Category } from '../../api/types'
import { CategoryIcon } from '../ui/CategoryIcon'
import { Photo } from '../ui/Photo'

interface CategoryTilesProps {
  categories: Category[]
  /** "tall" = overview grid with large image; "row" = compact accessory row. */
  variant?: 'tall' | 'row'
}

export function CategoryTiles({ categories, variant = 'tall' }: CategoryTilesProps) {
  return (
    <ul className={`grid gap-x-7 gap-y-8 sm:grid-cols-2 ${variant === 'tall' ? 'lg:grid-cols-3' : 'md:grid-cols-3'}`}>
      {categories.map((category) => (
        <li key={category.id}>
          <Link to={`/productos/${category.slug}`} className="group block">
            <span className={`block overflow-hidden bg-surface ${variant === 'tall' ? 'h-52' : 'h-48'}`}>
              <Photo
                src={category.imageUrl}
                alt=""
                width={420}
                height={variant === 'tall' ? 208 : 192}
                className="transition-transform duration-500 group-hover:scale-105"
                fallback={
                  <span className="flex h-full items-center justify-center">
                    <CategoryIcon icon={category.icon} className="h-20 w-20 text-brand" />
                  </span>
                }
              />
            </span>
            <span className="flex items-center justify-between border-b border-[#9a9a9a] px-2 py-3 text-sm font-bold group-hover:text-brand">
              {category.name}
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
