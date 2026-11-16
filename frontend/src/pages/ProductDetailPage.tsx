import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FileText, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Product } from '../api/types'
import { ListingCard } from '../components/catalog/ListingCard'
import { AddToCart } from '../components/shop/AddToCart'
import { CompareCheckbox } from '../components/ui/CompareCheckbox'
import { formatPrice, POWER_LABELS } from '../components/ui/format'
import { sizedImage } from '../components/ui/image'
import { ProductVisual } from '../components/ui/ProductVisual'
import { StateMessage } from '../components/ui/StateMessage'
import { useApi } from '../hooks/useApi'
import { NotFoundPage } from './NotFoundPage'

const TABS = [
  { id: 'detalles', label: 'Detalles técnicos' },
  { id: 'descripcion', label: 'Descripción' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'similares', label: 'Productos similares' },
]

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { data: product, loading, error } = useApi(() => api.product(slug), [slug])

  if (error && 'status' in error && error.status === 404) return <NotFoundPage />
  if (!product) {
    return (
      <div className="container-page py-16">
        <StateMessage loading={loading} error={error} />
      </div>
    )
  }
  return <ProductDetail key={product.slug} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [showAllSpecs, setShowAllSpecs] = useState(false)
  const variants = product.variants ?? []
  const [variantId, setVariantId] = useState(variants[0]?.id)
  const variant = variants.find((v) => v.id === variantId)
  const reference = variant?.reference ?? product.reference
  const price = variant?.price ?? product.price
  const similar = useApi(() => api.products({ category: product.category.slug }), [product.category.slug])
  const accessories = useApi(() => api.products({ kind: 'accessory', sort: 'popular' }), [])

  const gallery = [product.imageUrl, product.category.imageUrl].filter(
    (src, i, all): src is string => !!src && all.indexOf(src) === i,
  )
  const current = gallery[activeImage] ?? null
  const specs = Object.entries(product.specs)
  const others = (similar.data ?? []).filter((p) => p.id !== product.id).slice(0, 6)
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, SPEC_PREVIEW)
  const extras = (accessories.data ?? []).filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <>
      <div className="bg-surface">
        <Link
          to={`/productos/${product.category.slug}`}
          className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-4 text-sm font-bold hover:text-brand lg:px-5"
        >
          <ChevronLeft className="h-4 w-4" /> {product.category.name}
        </Link>
      </div>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 lg:grid-cols-2 lg:px-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold uppercase">{product.name}</h1>
          <span aria-hidden="true" className="mt-3 block h-1 w-9 bg-ink" />
          <div className="relative mt-8">
            {product.isNew && (
              <span className="absolute left-0 top-4 z-10 bg-brand px-3 py-1 font-display font-bold uppercase text-white">
                Nuevo
              </span>
            )}
            <ProductVisual key={current} size="lg" icon={product.category.icon} imageUrl={current} label={product.name} />
            {current && (
              <button
                type="button"
                onClick={() => setZoom(true)}
                className="absolute bottom-3 left-3 flex items-center gap-2 border border-ink bg-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-surface"
              >
                <ZoomIn className="h-4 w-4" /> Vista completa
              </button>
            )}
          </div>
          {gallery.length > 1 && (
            <ul className="mt-4 flex gap-3" aria-label="Imágenes del producto">
              {gallery.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={i === activeImage}
                    className={`block h-14 w-20 overflow-hidden border-b-4 ${i === activeImage ? 'border-ink' : 'border-transparent'}`}
                  >
                    <img src={sizedImage(src, 160, 112)} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit border border-line p-5 lg:mt-0">
          <p className="mb-3 text-sm">Selecciona el artículo</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {variants.length > 1 ? (
              <label className="flex flex-col bg-surface px-4 py-3 text-sm font-bold">
                <span className="sr-only">Selecciona el artículo</span>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(Number(e.target.value))}
                  className="cursor-pointer bg-transparent font-bold outline-none"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {product.name} · {v.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 font-normal">Ref. {reference}</span>
              </label>
            ) : (
              <div className="bg-surface px-4 py-5 text-sm font-bold">
                {product.name}
                <br />
                Ref. {reference}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Link
                to={`/distribuidores?categoria=${product.category.slug}`}
                className="bg-ink px-6 py-4 text-sm font-bold text-white hover:bg-black"
              >
                Encuentra tu distribuidor autorizado
              </Link>
              <CompareCheckbox slug={product.slug} name={product.name} />
            </div>
          </div>
          <p className="mt-6 text-2xl font-bold" aria-live="polite">{formatPrice(price)}</p>
          <p className="text-xs text-muted">
            Precio con IGV · {POWER_LABELS[product.powerSource]}
          </p>
          <AddToCart
            key={variant?.id ?? 'base'}
            item={{
              productId: product.id,
              variantId: variant?.id,
              slug: product.slug,
              name: product.name,
              variantLabel: variant?.label,
              reference,
              imageUrl: product.imageUrl,
              unitPrice: price,
            }}
          />
          <div className="mt-5 border border-line bg-[#fafafa] px-6 py-4">
            <p className="text-sm font-bold">¿Prefieres comprar en tienda?</p>
            <p className="mt-1 text-xs">
              También encuentras este producto en nuestras tiendas locales. Busca la tuya y contacta directamente
              para informarte sobre la disponibilidad.
            </p>
          </div>
          <Link
            to={`/manuales?q=${encodeURIComponent(product.name)}`}
            className="mt-5 flex items-center gap-2 border-b border-line pb-2 text-sm hover:text-brand"
          >
            <FileText className="h-4 w-4" /> Manuales de instrucciones
          </Link>
        </aside>
      </section>

      <nav aria-label="Secciones del producto" className="sticky top-[112px] z-30 bg-surface md:top-[157px]">
        <ul className="no-scrollbar flex justify-start overflow-x-auto md:justify-center">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <a
                href={`#${tab.id}`}
                className="block whitespace-nowrap border-b-4 border-transparent px-5 py-4 text-sm font-bold hover:border-brand"
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <section id="detalles" className="scroll-mt-48 py-14">
          <SectionTitle>Detalles técnicos</SectionTitle>
          {specs.length > 0 ? (
            <dl className="max-w-[920px]">
              {visibleSpecs.map(([key, value], i) => (
                <div key={key} className={`grid grid-cols-[1fr_1.5fr] text-sm ${i % 2 === 0 ? 'bg-[#ececec]' : ''}`}>
                  <dt className="border-r border-ink px-5 py-4">{key}</dt>
                  <dd className="px-5 py-4">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted">Sin datos técnicos.</p>
          )}
          {specs.length > SPEC_PREVIEW && (
            <div className="mt-8 flex max-w-[920px] justify-center">
              <button
                type="button"
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                aria-expanded={showAllSpecs}
                className="flex flex-col items-center gap-1 text-sm font-bold hover:text-brand"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
                  {showAllSpecs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
                {showAllSpecs ? "Mostrar menos" : "Mostrar todo"}
              </button>
            </div>
          )}
        </section>

        <section id="descripcion" className="max-w-3xl scroll-mt-48 pb-14">
          <SectionTitle>
            {product.name}: {product.summary.replace(/\.$/, '')}
          </SectionTitle>
          <p className="leading-relaxed">{product.description}</p>
        </section>

        {extras.length > 0 && (
          <section id="accesorios" className="scroll-mt-48 pb-14">
            <SectionTitle>Accesorios</SectionTitle>
            <ProductGrid products={extras} />
          </section>
        )}

      </div>

      {others.length > 0 && (
        <section id="similares" className="scroll-mt-48 bg-[#ececec] py-14">
          <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
            <SectionTitle>Productos similares</SectionTitle>
            <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {others.map((p) => (
                <li key={p.id} className="w-44 shrink-0 lg:w-auto lg:flex-1">
                  <CompactCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ServiceAndTips />

      {zoom && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name}, vista completa`}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-6"
        >
          <img src={sizedImage(current, 1600)} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </>
  )
}

const SPEC_PREVIEW = 5

function CompactCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group flex h-full flex-col border border-line bg-white p-4 hover:shadow-[0_0_0_1px_#2b2b2b]"
    >
      <span className="block h-24 overflow-hidden">
        {product.imageUrl && (
          <img src={sizedImage(product.imageUrl, 320, 192)} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="mt-4 text-sm font-bold">{product.name}</span>
      <span aria-hidden="true" className="mt-auto flex h-7 w-7 items-center justify-center self-end rounded-full bg-brand pt-0">
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

const SERVICES = [
  {
    title: "Instrucciones de uso",
    text: "Aquí encontrarás las instrucciones de uso correspondientes a nuestros productos Casa Maderero.",
    cta: "Encuentra las instrucciones de uso aquí",
    to: "/manuales",
  },
  {
    title: "FAQ",
    text: "¿Tienes alguna pregunta? Aquí encontrarás las respuestas a las preguntas más frecuentes.",
    cta: "Encuentra respuestas en el apartado de preguntas frecuentes",
    to: "/preguntas-frecuentes",
  },
  {
    title: "Guía de tallas",
    text: "Aquí encontrarás la guía de tallas de nuestros equipos de protección individual.",
    cta: "Ir a la guía de tallas",
    to: "/guia-de-tallas",
  },
]

function ServiceAndTips() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 lg:px-5">
      <SectionTitle>Servicio y consejos</SectionTitle>
      <ul className="grid gap-8 md:grid-cols-3">
        {SERVICES.map((s) => (
          <li key={s.title} className="flex flex-col">
            <h3 className="text-sm font-bold uppercase">{s.title}</h3>
            <p className="mt-5 flex-1 text-sm">{s.text}</p>
            <Link to={s.to} className="mt-8 w-fit bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-black">
              {s.cta}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-8 font-display text-2xl font-extrabold uppercase md:text-[28px]">{children}</h2>
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <li key={p.id}>
          <ListingCard product={p} />
        </li>
      ))}
    </ul>
  )
}
