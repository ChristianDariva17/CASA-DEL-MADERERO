import { adminApi } from '../../api/client'
import type { Article, Category, Dealer, FairEvent, FaqGroup, LegalPage, Product, Sector } from '../../api/types'
import {
  draftToSection,
  linesToList,
  optionalNumber,
  sectionToDraft,
  specsToText,
  str,
  textToSpecs,
  type FaqDraft,
  type Option,
  type SectionDraft,
  type VariantDraft,
} from '../../components/admin/fields'
import type { ResourceConfig } from '../../components/admin/ResourceManager'
import { formatDate, formatPrice, POWER_LABELS } from '../../components/ui/format'

const POWER_OPTIONS: Option[] = Object.entries(POWER_LABELS).map(([value, label]) => ({ value, label }))

const KIND_OPTIONS: Option[] = [
  { value: 'machine', label: 'Máquinas' },
  { value: 'accessory', label: 'Accesorios' },
]

const ICON_OPTIONS: Option[] = [
  { value: 'chainsaw', label: 'Motosierra' },
  { value: 'trimmer', label: 'Desbrozadora' },
  { value: 'hedge', label: 'Cortasetos' },
  { value: 'blower', label: 'Soplador' },
  { value: 'pump', label: 'Motobomba' },
  { value: 'sprayer', label: 'Pulverizador' },
  { value: 'washer', label: 'Hidrolavadora' },
  { value: 'pole', label: 'Podadora de altura' },
  { value: 'shield', label: 'Protección' },
  { value: 'oil', label: 'Lubricantes' },
  { value: 'tool', label: 'Herramienta (genérico)' },
]

const ARTICLE_KINDS: Option[] = [
  { value: 'news', label: 'Noticia' },
  { value: 'guide', label: 'Consejo / tutorial' },
]

const SERVICE_OPTIONS: Option[] = [
  { value: 'venta', label: 'Venta' },
  { value: 'servicio-tecnico', label: 'Servicio técnico' },
  { value: 'repuestos', label: 'Repuestos' },
  { value: 'alquiler', label: 'Alquiler' },
]

const SLUG_HINT = 'Minúsculas, números y guiones. Se usa en la dirección de la página.'

// Module-level loaders keep a stable identity, so options load once per form.
const categoryIdOptions = () =>
  adminApi.list<Category>('categories').then((list) => list.map((c) => ({ value: String(c.id), label: c.name })))
const categorySlugOptions = () =>
  adminApi.list<Category>('categories').then((list) => list.map((c) => ({ value: c.slug, label: c.name })))

const thumb = (url: string | null) =>
  url ? (
    <img src={url} alt="" className="h-10 w-14 object-cover" loading="lazy" />
  ) : (
    <span className="block h-10 w-14 bg-surface" />
  )

export const productConfig: ResourceConfig<Product> = {
  resource: 'products',
  title: 'Productos',
  singular: 'producto',
  searchText: (p) => `${p.name} ${p.reference} ${p.category.name}`,
  describe: (p) => p.name,
  columns: [
    { label: '', render: (p) => thumb(p.imageUrl), className: 'w-16' },
    {
      label: 'Producto',
      render: (p) => (
        <>
          <span className="font-bold">{p.name}</span>
          {p.isNew && <span className="ml-2 bg-brand px-1.5 text-[10px] font-bold uppercase">Nuevo</span>}
          <span className="block text-xs text-muted">Ref. {p.reference || '—'}</span>
        </>
      ),
    },
    { label: 'Categoría', render: (p) => p.category.name },
    { label: 'Accionamiento', render: (p) => POWER_LABELS[p.powerSource] },
    { label: 'Precio', render: (p) => formatPrice(p.price), className: 'text-right' },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', hint: SLUG_HINT },
    { name: 'reference', label: 'Referencia', type: 'text' },
    { name: 'categoryId', label: 'Categoría', type: 'select', options: categoryIdOptions },
    { name: 'powerSource', label: 'Accionamiento', type: 'select', options: POWER_OPTIONS },
    { name: 'price', label: 'Precio (S/, con IGV)', type: 'number' },
    { name: 'imageUrl', label: 'Imagen', type: 'image' },
    { name: 'summary', label: 'Resumen', type: 'textarea' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    {
      name: 'specs',
      label: 'Datos técnicos',
      type: 'keyvalue',
      hint: 'Uno por línea, con el formato "Nombre: valor". Ej.: Peso: 4,6 kg',
    },
    {
      name: 'variants',
      label: 'Variantes',
      type: 'variants',
      hint: 'Largos de espada, tallas, etc. Si hay variantes, el cliente debe elegir una al comprar y paga su precio.',
    },
    { name: 'isNew', label: 'Marcar como novedad', type: 'checkbox' },
  ],
  toForm: (p) => ({
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    reference: p?.reference ?? '',
    categoryId: p ? String(p.category.id) : '',
    powerSource: p?.powerSource ?? 'petrol',
    price: p?.price ?? '',
    imageUrl: p?.imageUrl ?? '',
    summary: p?.summary ?? '',
    description: p?.description ?? '',
    specs: specsToText(p?.specs),
    variants: (p?.variants ?? []).map(
      (v): VariantDraft => ({ id: v.id, label: v.label, reference: v.reference, price: v.price }),
    ),
    isNew: p?.isNew ?? false,
  }),
  toPayload: (v) => ({
    name: str(v.name),
    slug: str(v.slug),
    reference: str(v.reference),
    categoryId: optionalNumber(v.categoryId),
    powerSource: str(v.powerSource),
    price: optionalNumber(v.price),
    imageUrl: str(v.imageUrl),
    summary: str(v.summary),
    description: str(v.description),
    specs: textToSpecs(str(v.specs)),
    variants: (v.variants as VariantDraft[]).map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      label: variant.label,
      reference: variant.reference,
      price: optionalNumber(variant.price),
    })),
    isNew: v.isNew === true,
  }),
}

export const categoryConfig: ResourceConfig<Category> = {
  resource: 'categories',
  title: 'Categorías',
  singular: 'categoría',
  searchText: (c) => `${c.name} ${c.slug}`,
  describe: (c) => c.name,
  columns: [
    { label: '', render: (c) => thumb(c.imageUrl), className: 'w-16' },
    {
      label: 'Categoría',
      render: (c) => (
        <>
          <span className="font-bold">{c.name}</span>
          <span className="block text-xs text-muted">/productos/{c.slug}</span>
        </>
      ),
    },
    { label: 'Tipo', render: (c) => (c.kind === 'machine' ? 'Máquinas' : 'Accesorios') },
    { label: 'Orden', render: (c) => c.position, className: 'text-right' },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', hint: SLUG_HINT },
    { name: 'kind', label: 'Tipo', type: 'select', options: KIND_OPTIONS },
    { name: 'icon', label: 'Ícono', type: 'select', options: ICON_OPTIONS },
    { name: 'position', label: 'Orden en los listados', type: 'number' },
    { name: 'imageUrl', label: 'Imagen', type: 'image' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ],
  toForm: (c) => ({
    name: c?.name ?? '',
    slug: c?.slug ?? '',
    kind: c?.kind ?? 'machine',
    icon: c?.icon ?? 'tool',
    position: c?.position ?? 0,
    imageUrl: c?.imageUrl ?? '',
    description: c?.description ?? '',
  }),
  toPayload: (v) => ({
    name: str(v.name),
    slug: str(v.slug),
    kind: str(v.kind),
    icon: str(v.icon) || 'tool',
    position: optionalNumber(v.position) ?? 0,
    imageUrl: str(v.imageUrl),
    description: str(v.description),
  }),
}

export const articleConfig: ResourceConfig<Article> = {
  resource: 'articles',
  title: 'Noticias y consejos',
  singular: 'artículo',
  searchText: (a) => `${a.title} ${a.slug}`,
  describe: (a) => a.title,
  columns: [
    { label: '', render: (a) => thumb(a.imageUrl), className: 'w-16' },
    {
      label: 'Título',
      render: (a) => (
        <>
          <span className="font-bold">{a.title}</span>
          <span className="block text-xs text-muted">/articulos/{a.slug}</span>
        </>
      ),
    },
    { label: 'Tipo', render: (a) => (a.kind === 'news' ? 'Noticia' : 'Consejo') },
    { label: 'Publicado', render: (a) => formatDate(a.publishedAt) },
  ],
  fields: [
    { name: 'title', label: 'Título', type: 'text', wide: true },
    { name: 'slug', label: 'Slug', type: 'text', hint: SLUG_HINT },
    { name: 'kind', label: 'Tipo', type: 'select', options: ARTICLE_KINDS },
    { name: 'publishedAt', label: 'Fecha de publicación', type: 'date' },
    { name: 'imageUrl', label: 'Imagen', type: 'image' },
    { name: 'excerpt', label: 'Extracto (se muestra en los listados)', type: 'textarea' },
    { name: 'lead', label: 'Introducción', type: 'textarea' },
    {
      name: 'sections',
      label: 'Secciones',
      type: 'sections',
      hint: 'Cada sección aparece en el índice del artículo.',
    },
    {
      name: 'body',
      label: 'Texto simple',
      type: 'textarea',
      hint: 'Solo se muestra si el artículo no tiene secciones.',
    },
  ],
  toForm: (a) => ({
    title: a?.title ?? '',
    slug: a?.slug ?? '',
    kind: a?.kind ?? 'news',
    publishedAt: a?.publishedAt ?? new Date().toISOString().slice(0, 10),
    imageUrl: a?.imageUrl ?? '',
    excerpt: a?.excerpt ?? '',
    lead: a?.lead ?? '',
    sections: (a?.sections ?? []).map(sectionToDraft),
    body: a?.body ?? '',
  }),
  toPayload: (v) => ({
    title: str(v.title),
    slug: str(v.slug),
    kind: str(v.kind),
    publishedAt: str(v.publishedAt),
    imageUrl: str(v.imageUrl),
    excerpt: str(v.excerpt),
    lead: str(v.lead),
    sections: (v.sections as SectionDraft[]).map(draftToSection),
    body: str(v.body),
  }),
}

export const dealerConfig: ResourceConfig<Dealer> = {
  resource: 'dealers',
  title: 'Distribuidores',
  singular: 'distribuidor',
  searchText: (d) => `${d.name} ${d.city} ${d.region}`,
  describe: (d) => d.name,
  columns: [
    {
      label: 'Distribuidor',
      render: (d) => (
        <>
          <span className="font-bold">{d.name}</span>
          <span className="block text-xs text-muted">{d.address}</span>
        </>
      ),
    },
    { label: 'Ciudad', render: (d) => `${d.city}, ${d.region}` },
    { label: 'Teléfono', render: (d) => d.phone },
    {
      label: 'Servicios',
      render: (d) => d.services.map((s) => SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s).join(', '),
    },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'phone', label: 'Teléfono', type: 'text' },
    { name: 'address', label: 'Dirección', type: 'text', wide: true },
    { name: 'city', label: 'Ciudad', type: 'text' },
    { name: 'region', label: 'Región', type: 'text' },
    { name: 'lat', label: 'Latitud', type: 'number', hint: 'Ej.: -12.0464. Sin coordenadas no aparece en el mapa.' },
    { name: 'lng', label: 'Longitud', type: 'number', hint: 'Ej.: -77.0428' },
    { name: 'services', label: 'Servicios', type: 'checkboxes', options: SERVICE_OPTIONS },
    {
      name: 'categories',
      label: 'Gama de productos',
      type: 'checkboxes',
      options: categorySlugOptions,
      hint: 'Sin ninguna marcada se considera que vende toda la gama.',
    },
  ],
  toForm: (d) => ({
    name: d?.name ?? '',
    phone: d?.phone ?? '',
    address: d?.address ?? '',
    city: d?.city ?? '',
    region: d?.region ?? '',
    lat: d?.lat ?? '',
    lng: d?.lng ?? '',
    services: d?.services ?? ['venta'],
    categories: d?.categories ?? [],
  }),
  toPayload: (v) => ({
    name: str(v.name),
    phone: str(v.phone),
    address: str(v.address),
    city: str(v.city),
    region: str(v.region),
    lat: optionalNumber(v.lat) ?? null,
    lng: optionalNumber(v.lng) ?? null,
    services: v.services,
    categories: v.categories,
  }),
}

const RICH_TEXT_HINT =
  'Deja una línea en blanco entre párrafos. "- " al inicio de línea crea viñetas, [texto](/ruta) crea un enlace y **texto** va en negrita.'

const EVENT_KIND_OPTIONS: Option[] = [
  { value: 'Feria', label: 'Feria' },
  { value: 'Demostración', label: 'Demostración' },
  { value: 'Competencia', label: 'Competencia' },
]

export const sectorConfig: ResourceConfig<Sector> = {
  resource: 'content/sectors',
  title: 'Sectores profesionales',
  singular: 'sector',
  searchText: (s) => `${s.title} ${s.slug}`,
  describe: (s) => s.title,
  columns: [
    { label: '', render: (s) => thumb(s.imageUrl), className: 'w-16' },
    {
      label: 'Sector',
      render: (s) => (
        <>
          <span className="font-bold">{s.title}</span>
          <span className="block text-xs text-muted">/profesional/{s.slug}</span>
        </>
      ),
    },
    { label: 'Productos', render: (s) => s.productSlugs.length, className: 'text-right' },
    { label: 'Orden', render: (s) => s.position, className: 'text-right' },
  ],
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', hint: SLUG_HINT },
    { name: 'machinesTitle', label: 'Título de la sección de máquinas', type: 'text' },
    { name: 'position', label: 'Orden', type: 'number' },
    { name: 'intro', label: 'Introducción', type: 'textarea' },
    { name: 'imageUrl', label: 'Imagen principal', type: 'image' },
    { name: 'categories', label: 'Categorías destacadas', type: 'checkboxes', options: categorySlugOptions },
    {
      name: 'productSlugs',
      label: 'Productos destacados',
      type: 'lines',
      hint: 'Un slug de producto por línea, en el orden en que se muestran. Ej.: cm-661',
    },
  ],
  toForm: (s) => ({
    title: s?.title ?? '',
    slug: s?.slug ?? '',
    machinesTitle: s?.machinesTitle ?? '',
    position: s?.position ?? 0,
    intro: s?.intro ?? '',
    imageUrl: s?.imageUrl ?? '',
    categories: s?.categories ?? [],
    productSlugs: (s?.productSlugs ?? []).join('\n'),
  }),
  toPayload: (v) => ({
    title: str(v.title),
    slug: str(v.slug),
    machinesTitle: str(v.machinesTitle),
    position: optionalNumber(v.position) ?? 0,
    intro: str(v.intro),
    imageUrl: str(v.imageUrl),
    categories: v.categories,
    productSlugs: linesToList(v.productSlugs),
  }),
}

export const eventConfig: ResourceConfig<FairEvent> = {
  resource: 'content/events',
  title: 'Ferias y eventos',
  singular: 'evento',
  searchText: (e) => `${e.name} ${e.city} ${e.kind}`,
  describe: (e) => e.name,
  columns: [
    {
      label: 'Evento',
      render: (e) => (
        <>
          <span className="font-bold">{e.name}</span>
          <span className="block text-xs text-muted">{e.kind}</span>
        </>
      ),
    },
    { label: 'Ciudad', render: (e) => e.city },
    {
      label: 'Fechas',
      render: (e) =>
        e.startDate === e.endDate ? formatDate(e.startDate) : `${formatDate(e.startDate)} – ${formatDate(e.endDate)}`,
    },
  ],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', wide: true },
    { name: 'kind', label: 'Tipo', type: 'select', options: EVENT_KIND_OPTIONS },
    { name: 'city', label: 'Ciudad', type: 'text' },
    { name: 'startDate', label: 'Inicio', type: 'date' },
    { name: 'endDate', label: 'Fin', type: 'date' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    {
      name: 'link',
      label: 'Enlace "Más información" (opcional)',
      type: 'text',
      wide: true,
      hint: 'Una ruta del sitio (/experiencia/copa-de-hacheros) o una dirección https://',
    },
  ],
  toForm: (e) => ({
    name: e?.name ?? '',
    kind: e?.kind ?? 'Feria',
    city: e?.city ?? '',
    startDate: e?.startDate ?? '',
    endDate: e?.endDate ?? '',
    description: e?.description ?? '',
    link: e?.link ?? '',
  }),
  toPayload: (v) => ({
    name: str(v.name),
    kind: str(v.kind),
    city: str(v.city),
    startDate: str(v.startDate),
    // A one-day event may leave the end empty.
    endDate: str(v.endDate) || str(v.startDate),
    description: str(v.description),
    link: str(v.link),
  }),
}

export const faqConfig: ResourceConfig<FaqGroup> = {
  resource: 'content/faqs',
  title: 'Preguntas frecuentes',
  singular: 'grupo',
  searchText: (g) => `${g.title} ${g.items.map((i) => i.question).join(' ')}`,
  describe: (g) => g.title,
  columns: [
    {
      label: 'Grupo',
      render: (g) => (
        <>
          <span className="font-bold">{g.title}</span>
          <span className="block text-xs text-muted">/preguntas-frecuentes#{g.slug}</span>
        </>
      ),
    },
    { label: 'Preguntas', render: (g) => g.items.length, className: 'text-right' },
    { label: 'Orden', render: (g) => g.position, className: 'text-right' },
  ],
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    { name: 'slug', label: 'Slug', type: 'text', hint: 'Ancla del grupo en la página, ej.: baterias' },
    { name: 'position', label: 'Orden', type: 'number' },
    { name: 'intro', label: 'Introducción', type: 'textarea' },
    { name: 'items', label: 'Preguntas', type: 'faqitems', hint: `Respuestas: ${RICH_TEXT_HINT}` },
  ],
  toForm: (g) => ({
    title: g?.title ?? '',
    slug: g?.slug ?? '',
    position: g?.position ?? 0,
    intro: g?.intro ?? '',
    items: (g?.items ?? []).map((i): FaqDraft => ({ ...i })),
  }),
  toPayload: (v) => ({
    title: str(v.title),
    slug: str(v.slug),
    position: optionalNumber(v.position) ?? 0,
    intro: str(v.intro),
    items: v.items,
  }),
}

export const legalConfig: ResourceConfig<LegalPage> = {
  resource: 'content/legal',
  title: 'Textos legales',
  singular: 'texto',
  searchText: (l) => `${l.title} ${l.slug}`,
  describe: (l) => l.title,
  columns: [
    {
      label: 'Página',
      render: (l) => (
        <>
          <span className="font-bold">{l.title}</span>
          <span className="block text-xs text-muted">/legal/{l.slug}</span>
        </>
      ),
    },
  ],
  fields: [
    { name: 'title', label: 'Título', type: 'text' },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      hint: 'El pie de página enlaza aviso-legal, privacidad, cookies e informacion-legal: no los cambies.',
    },
    { name: 'body', label: 'Texto', type: 'textarea', hint: RICH_TEXT_HINT },
  ],
  toForm: (l) => ({ title: l?.title ?? '', slug: l?.slug ?? '', body: l?.body ?? '' }),
  toPayload: (v) => ({ title: str(v.title), slug: str(v.slug), body: str(v.body) }),
}
