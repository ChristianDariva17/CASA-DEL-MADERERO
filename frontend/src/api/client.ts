import { getToken, UNAUTHORIZED_EVENT } from './session'
import type {
  AdminSummary,
  Article,
  ArticleKind,
  Category,
  CategoryKind,
  Complaint,
  ComplaintInput,
  CreatedOrder,
  CreateOrderInput,
  Customer,
  Dealer,
  DealerQuery,
  Facet,
  FairEvent,
  FaqGroup,
  LegalPage,
  Order,
  OrderStatus,
  Product,
  ProductQuery,
  Sector,
  Session,
  User,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      // JSON bodies only; FormData lets the browser set the multipart boundary.
      ...(typeof init?.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new ApiError(response.status, message ?? response.statusText)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

const send = <T>(method: string, path: string, body?: unknown) =>
  request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const api = {
  categories: (kind?: CategoryKind) => request<Category[]>(`/categories${toQuery({ kind })}`),
  category: (slug: string) => request<Category>(`/categories/${slug}`),
  products: (params: ProductQuery = {}) =>
    request<Product[]>(
      `/products${toQuery({
        category: params.category,
        kind: params.kind,
        q: params.q,
        new: params.isNew === undefined ? undefined : String(params.isNew),
        power: params.power?.length ? params.power.join(',') : undefined,
        maxPrice: params.maxPrice,
        sort: params.sort,
        ...Object.fromEntries(
          Object.entries(params.facets ?? {}).map(([key, values]) => [`f_${key}`, values.join(',') || undefined]),
        ),
      })}`,
    ),
  facets: (params: { category?: string; q?: string }) =>
    request<Facet[]>(`/products/facets${toQuery({ category: params.category, q: params.q })}`),
  product: (slug: string) => request<Product>(`/products/${slug}`),
  articles: (kind?: ArticleKind) => request<Article[]>(`/articles${toQuery({ kind })}`),
  article: (slug: string) => request<Article>(`/articles/${slug}`),
  dealers: (params: DealerQuery = {}) => request<Dealer[]>(`/dealers${toQuery({ ...params })}`),
  subscribe: (email: string) => send<{ email: string }>('POST', '/newsletter', { email }),
  createComplaint: (input: ComplaintInput) =>
    send<{ code: string; createdAt: string }>('POST', '/complaints', input),

  sector: (slug: string) => request<Sector>(`/content/sectors/${encodeURIComponent(slug)}`),
  events: () => request<FairEvent[]>('/content/events'),
  faqs: () => request<FaqGroup[]>('/content/faqs'),
  legalPage: (slug: string) => request<LegalPage>(`/content/legal/${encodeURIComponent(slug)}`),

  login: (email: string, password: string) => send<Session>('POST', '/auth/login', { email, password }),
  register: (fullName: string, email: string, password: string) =>
    send<Session>('POST', '/auth/register', { fullName, email, password }),
  me: () => request<User>('/auth/me'),

  createOrder: (input: CreateOrderInput) => send<CreatedOrder>('POST', '/orders', input),
  myOrders: () => request<Order[]>('/orders/mine'),
  myOrder: (code: string) => request<Order>(`/orders/mine/${encodeURIComponent(code)}`),
  paySimulated: (code: string, approved: boolean) =>
    send<Order>('POST', `/orders/mine/${encodeURIComponent(code)}/simulated-payment`, { approved }),
}

/** Admin-only endpoints; the server answers 403 to any other role. */
export const adminApi = {
  summary: () => request<AdminSummary>('/admin/summary'),
  orders: (status?: OrderStatus) => request<Order[]>(`/admin/orders${toQuery({ status })}`),
  setOrderStatus: (id: number, status: OrderStatus) => send<Order>('PATCH', `/admin/orders/${id}`, { status }),
  customers: () => request<Customer[]>('/admin/customers'),
  complaints: () => request<Complaint[]>('/admin/complaints'),
  list: <T>(resource: AdminResource) => request<T[]>(`/admin/${resource}`),
  create: <T>(resource: AdminResource, body: unknown) => send<T>('POST', `/admin/${resource}`, body),
  update: <T>(resource: AdminResource, id: number, body: unknown) =>
    send<T>('PATCH', `/admin/${resource}/${id}`, body),
  remove: (resource: AdminResource, id: number) => send<void>('DELETE', `/admin/${resource}/${id}`),
  /** Stores an image and returns its URL, e.g. "/api/uploads/<uuid>.png". */
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string }>('/admin/uploads', { method: 'POST', body: form })
  },
}

export type AdminResource =
  | 'products'
  | 'categories'
  | 'articles'
  | 'dealers'
  | 'content/sectors'
  | 'content/events'
  | 'content/faqs'
  | 'content/legal'
