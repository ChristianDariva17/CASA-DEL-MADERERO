# Casa Maderero

Corporate catalog site for forestry and garden tools. Its layout follows the structure of a
manufacturer's corporate site (orange top banner, mega menu, hero carousel, category strip, new
products, news, battery banner, guides, newsletter, footer) using Casa Maderero's own branding
and placeholder visuals.

| Layer    | Stack                                                    |
| -------- | -------------------------------------------------------- |
| Backend  | NestJS 11, TypeORM, PostgreSQL 17, TypeScript            |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router |

## Run locally

```bash
docker compose up -d                       # PostgreSQL on :5432
cd backend && npm install && npm run start:dev   # API on :3000 (seeds demo data on first boot)
cd frontend && npm install && npm run dev        # Web on :5173 (proxies /api to :3000)
```

Backend configuration lives in `backend/.env` (see `backend/.env.example`).
`DB_SYNC=true` lets TypeORM create the schema automatically; switch to migrations before production.

Accounts need these variables in `backend/.env` (the API refuses to start without `JWT_SECRET`):

| Variable | Purpose |
| -------- | ------- |
| `JWT_SECRET` | Signs session tokens. At least 32 random characters, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | First admin account, created on boot only when no admin exists yet (password ≥ 8 characters) |
| `AUTH_THROTTLE_LIMIT` | Optional. Login / sign-up attempts per minute per client (default 10) |
| `TRUST_PROXY` | Optional. Number of reverse-proxy hops in front of the API, so the rate limit sees real client IPs |
| `PAYMENT_PROVIDER` | Optional, default `simulated`. The simulated gateway refuses to start when `NODE_ENV=production` |
| `UPLOAD_DIR` | Optional, default `backend/uploads`. Where panel image uploads are stored; mount a persistent volume there in production |

## Accounts, shop and admin panel

- One login at `/ingresar`: admins land on `/admin`, customers on `/mi-cuenta` (or back to the page that asked them to sign in). Customers sign up at `/registro`; admins are only created from the environment.
- Purchase: `/carrito` (stored in the browser) → `/checkout` (shipping data, requires an account) → order created with prices read from the database → payment.
- Payment goes through the `PaymentGateway` interface in `backend/src/orders/payment-gateway.ts`. Until a real provider (Mercado Pago, Culqi, Niubiz) is chosen, `SimulatedPaymentGateway` sends the customer to `/pago/:code`, where the payment is approved or rejected by hand. A real provider implements `createCheckout` and confirms payments from its webhook.
- Admin panel `/admin`: summary, orders (status changes), products (with their variants), categories, news and tips, dealers, professional sectors, fairs and events, FAQ and legal texts (create / edit / delete), customers and complaints (read-only). Every `/api/admin/*` route checks the admin role on the server.
- Image fields accept a pasted URL or "Subir imagen": JPG, PNG or WebP up to 5 MB, checked by content, stored in `UPLOAD_DIR` and served at `/api/uploads/<name>`. The frontend must reach the API on the same origin (`/api`, as the Vite proxy does) for those paths to load.
- Sectors, events, FAQ and legal texts live in the database. Each empty table is filled once on startup with the original texts (`backend/src/content/content.seed-data.ts`); edits are never overwritten.
- FAQ answers and legal texts use a small text format: a blank line between paragraphs, lines starting with `- ` for bullets, `[texto](/ruta)` or `[texto](https://…)` for links and `**texto**` for bold.

## Views

`/` home · `/productos` and `/accesorios` overviews · `/productos/:category` listing (filters, sort, compare) · `/busqueda?q=` search · `/producto/:slug` product · `/comparar` compare · `/distribuidores` dealer locator (Leaflet + OpenStreetMap) · `/profesional`, `/profesional/:sector`, `/consejos`, `/informacion-y-servicios` hubs · `/ferias-y-eventos` · `/experiencia/copa-de-hacheros` · `/campanas/:slug` · `/guia-de-tallas` · `/noticias` · `/articulos/:slug` · `/contacto` · `/preguntas-frecuentes` · `/manuales` · `/legal/:slug` · `/libro-de-reclamaciones` · `/ingresar` · `/registro` · `/carrito` · `/checkout` · `/pago/:code` · `/mi-cuenta` · `/mi-cuenta/pedidos/:code` · `/admin/*` · 404.

## API (`/api`)

| Method | Path                | Notes                                                                 |
| ------ | ------------------- | --------------------------------------------------------------------- |
| GET    | `/categories`       | `?kind=machine|accessory`                                            |
| GET    | `/categories/:slug` |                                                                       |
| GET    | `/products`         | `?category&kind&new=true&q&power=petrol,battery&maxPrice&sort=name|popular|price-asc|price-desc&f_<facet>=a,b` |
| GET    | `/products/facets`  | `?category&q` → category facets with option counts                    |
| GET    | `/products/:slug`   | includes `variants`                                                   |
| GET    | `/articles`         | `?kind=news|guide`                                                   |
| GET    | `/articles/:slug`   | includes `lead` and `sections`                                       |
| GET    | `/dealers`          | `?q&service&category&lat&lng&radiusKm` (distance in km when lat/lng)  |
| POST   | `/newsletter`       | `{ "email": "..." }` → 201, 400, 409                                  |
| POST   | `/complaints`       | Libro de Reclamaciones → 201 `{ code }`, 400                           |
| POST   | `/auth/register`    | `{ fullName, email, password }` → 201 `{ accessToken, user }` (always a customer), 400, 409 |
| POST   | `/auth/login`       | `{ email, password }` → 200 `{ accessToken, user }`, 401               |
| GET    | `/auth/me`          | Bearer token → current user, 401                                       |
| POST   | `/orders`           | Bearer. `{ items: [{ productId, variantId?, quantity }], fullName, documentNumber, phone, address, city, region }` → 201 `{ code, total, redirectUrl }` |
| GET    | `/orders/mine`, `/orders/mine/:code` | Bearer. Only the signed-in customer's orders (404 otherwise) |
| POST   | `/orders/mine/:code/simulated-payment` | Bearer. `{ approved }`; only with the simulated gateway, 409 when already paid |
| GET    | `/content/sectors`, `/content/sectors/:slug` | Professional sectors |
| GET    | `/content/events`   | Fairs, demos and competitions, by start date                          |
| GET    | `/content/faqs`     | FAQ groups with their questions                                       |
| GET    | `/content/legal/:slug` | Legal text                                                         |
| *      | `/admin/...`        | Admin role only (401 / 403): `summary`, `orders` (`PATCH :id { status }`), `products` (optional `variants: [{ id?, label, reference?, price }]` replaces the set), `categories`, `articles`, `dealers`, `content/sectors`, `content/events`, `content/faqs`, `content/legal` (GET, POST, PATCH `:id`, DELETE `:id`), `customers`, `complaints` |
| POST   | `/admin/uploads`    | Admin. Multipart field `file` → 201 `{ url }`, 400 (not JPG/PNG/WebP), 413 (over 5 MB) |

## Images

Demo photos are hot-linked from Unsplash (free under the Unsplash License) and mapped by slug in
`backend/src/database/seed-images.ts`. Some stock photos show small, unreadable brand markings on
third-party tools: replace them with your own product photography before going live. Every image falls
back to an icon if it fails to load.

## Tests

```bash
cd backend && npm run test:e2e
```

Jest runs with `--experimental-vm-modules` because `@nestjs/typeorm` 12 is ESM-only.

`test/accounts-shop.e2e-spec.ts` and `test/admin-panel.e2e-spec.ts` run against a real Postgres
database that they wipe on start (`TEST_DB_NAME`, default `casa_maderero_test`; suites run one at a
time). Create it once:

```bash
docker exec casa-maderero-db psql -U casa -d casa_maderero -c "CREATE DATABASE casa_maderero_test"
```
