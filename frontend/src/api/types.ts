export type CategoryKind = 'machine' | 'accessory'

export interface Category {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  kind: CategoryKind
  imageUrl: string | null
  position: number
}

export type PowerSource = 'petrol' | 'battery' | 'electric'

export type ProductSort = 'name' | 'popular' | 'price-asc' | 'price-desc'

export interface Product {
  id: number
  slug: string
  name: string
  reference: string
  summary: string
  description: string
  price: string
  powerSource: PowerSource
  specs: Record<string, string>
  isNew: boolean
  imageUrl: string | null
  category: Category
  /** Present on the product detail endpoint only. */
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: number
  label: string
  reference: string
  price: string
  position: number
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface Facet {
  key: string
  label: string
  options: FacetOption[]
}

export interface ProductQuery {
  category?: string
  kind?: CategoryKind
  isNew?: boolean
  q?: string
  power?: PowerSource[]
  maxPrice?: number
  sort?: ProductSort
  /** Selected facet options keyed by facet key. */
  facets?: Record<string, string[]>
}

export type ArticleKind = 'news' | 'guide'

export interface ArticleSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  lead: string
  body: string
  sections: ArticleSection[]
  kind: ArticleKind
  imageUrl: string | null
  publishedAt: string
}

export type DealerService = 'venta' | 'servicio-tecnico' | 'repuestos' | 'alquiler'

export interface Dealer {
  id: number
  name: string
  city: string
  region: string
  address: string
  phone: string
  lat: number | null
  lng: number | null
  services: DealerService[]
  categories: string[]
  distanceKm: number | null
}

export interface DealerQuery {
  q?: string
  service?: DealerService
  category?: string
  lat?: number
  lng?: number
  radiusKm?: number
}

export interface ComplaintInput {
  kind: 'reclamo' | 'queja'
  fullName: string
  documentType: 'DNI' | 'CE' | 'Pasaporte' | 'RUC'
  documentNumber: string
  email: string
  phone: string
  address: string
  productOrService: string
  amount?: number
  detail: string
  request: string
}

export type UserRole = 'admin' | 'customer'

export interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
}

export interface Session {
  accessToken: string
  user: User
}

export type OrderStatus = 'pending_payment' | 'payment_failed' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: number
  productId: number
  productSlug: string
  productName: string
  reference: string
  variantLabel: string | null
  imageUrl: string | null
  unitPrice: string
  quantity: number
  lineTotal: string
}

export interface Order {
  id: number
  code: string
  status: OrderStatus
  total: string
  email: string
  fullName: string
  documentNumber: string
  phone: string
  address: string
  city: string
  region: string
  paymentProvider: string
  paidAt: string | null
  items: OrderItem[]
  createdAt: string
}

export interface ShippingInput {
  fullName: string
  documentNumber: string
  phone: string
  address: string
  city: string
  region: string
}

export interface CreateOrderInput extends ShippingInput {
  items: { productId: number; variantId?: number; quantity: number }[]
}

export interface CreatedOrder {
  code: string
  status: OrderStatus
  total: string
  /** Internal route (simulated payment) or the gateway's absolute URL. */
  redirectUrl: string
}

export interface AdminSummary {
  ordersByStatus: Record<OrderStatus, number>
  revenue: string
  products: number
  customers: number
  complaints: number
  recentOrders: Order[]
}

export interface Customer extends User {
  createdAt: string
  orders: number
}

export interface Complaint {
  id: number
  code: string
  kind: 'reclamo' | 'queja'
  fullName: string
  documentType: string
  documentNumber: string
  email: string
  phone: string
  address: string
  productOrService: string
  amount: string | null
  detail: string
  request: string
  createdAt: string
}

export interface Sector {
  id: number
  slug: string
  title: string
  machinesTitle: string
  intro: string
  imageUrl: string | null
  /** Category slugs shown as "Todas las … profesionales" links. */
  categories: string[]
  /** Products shown in "Máquinas … y accesorios". */
  productSlugs: string[]
  position: number
}

export type EventKind = 'Feria' | 'Demostración' | 'Competencia'

export interface FairEvent {
  id: number
  name: string
  kind: EventKind
  city: string
  /** ISO date, "2026-11-27". */
  startDate: string
  endDate: string
  description: string
  /** Optional "Más información" link: a site path or an http(s) URL. */
  link: string
}

export interface FaqItem {
  question: string
  /** Rich text, see components/ui/RichText. */
  answer: string
}

export interface FaqGroup {
  id: number
  slug: string
  title: string
  intro: string
  items: FaqItem[]
  position: number
}

export interface LegalPage {
  id: number
  slug: string
  title: string
  /** Rich text, see components/ui/RichText. */
  body: string
}
