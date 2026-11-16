# Inner views (stihl.pe templates)

Objective: rebuild every page template of the reference (stihl.pe) for Casa Maderero. Not a git repo → no commits.
Delivery: single local change. Test runner: backend `npm run test:e2e` (Jest); frontend `npm run build` + `oxlint` + visual check.

## Specs

- S1 Global chrome (from reference): newsletter is an orange centered block (heading, "E-mail" label, input, black "SUSCRÍBETE AQUÍ" button, social icons + hashtag); footer is light gray with three columns (La Empresa / Preguntas frecuentes (FAQs) / Contacto), divider, legal links row and company address. Inner pages show "Página principal > …" breadcrumbs and an uppercase title with a short dark underline bar. Mega-menu links point to the real new routes.
- S2 Products overview (`/productos`) and accessories overview (`/accesorios`): "MÁQUINAS Y HERRAMIENTAS" / "ACCESORIOS" title, 3-column grid of category tiles (image + name + chevron, bottom border), "N DE N CATEGORÍAS".
- S3 Category listing (`/productos/:category`): left "Filtro" accordions (Accionamiento, Precio), "Ordenar" select (Popularidad, Nombre, Precio ↑, Precio ↓), bordered product cards (image, name, category, "Comparar" checkbox, round orange arrow), "N DE N PRODUCTOS", "Volver al principio", and an accessories tiles row.
- S4 Search (`/busqueda?q=`): title `RESULTADOS DE LA BÚSQUEDA "X" (n)` with the same filter/sort/grid plus a Categoría filter.
- S5 Product detail (`/producto/:slug`): gray back bar "< Categoría"; left name + bar + large image + thumbnails; right box with "Selecciona el artículo" (name + Ref.), dark "Encuentra tu distribuidor" button, "Comparar" checkbox, local-dealer note and "Manuales de instrucciones" link; sticky gray tab bar (Detalles técnicos, Descripción, Accesorios, Productos similares) with zebra spec table, description, accessories and similar products.
- S6 Compare (`/comparar`): products ticked with "Comparar" (max 3) shown side by side with their specs; a floating compare bar appears while any are selected.
- S7 Dealer locator (`/distribuidores`): "ENCUENTRA TU DISTRIBUIDOR AUTORIZADO", fields Búscalo aquí, Distancia máxima, Gama de productos, Servicios; "N Resultados de la búsqueda"; tabs Mapa | Listado with an interactive map.
- S8 Hub pages: Área profesional (`/profesional`) mirrors the reference (split hero, 3 product links + button, "Todo sobre tu sector" tiles, safety block, "Protégete de la cabeza a los pies"); Consejos y Tutoriales (`/consejos`) and Información y Servicios (`/informacion-y-servicios`) reuse the same hub building blocks.
- S9 Article detail (`/articulos/:slug`): breadcrumbs, title, italic lead, date, hero image, ↓ table of contents linking to sections, sections with headings, paragraphs and bullet lists.
- S10 News (`/noticias`): alternating text/image rows with title, text and arrow link.
- S11 Contact (`/contacto`): intro line, "CORREO ELECTRÓNICO" (image + text + emails) and "LLÁMANOS" (text + phone + image).
- S12 FAQ (`/preguntas-frecuentes`): grouped accordions of questions.
- S13 Manuals (`/manuales`): intro, search input with results, "Tenga en cuenta…" accordion, "Servicios de los concesionarios" two image tiles.
- S14 Legal (`/legal/:slug` for aviso-legal, privacidad, cookies, informacion-legal) as text pages; Libro de Reclamaciones (`/libro-de-reclamaciones`) as a working complaint form persisted by the API.
- S15 404: full-bleed forest photo with a white card "¿TE HAS PERDIDO?", error text and links to search and home.
- S16 Cookie consent dialog on first visit (Aceptar todas / Rechazar todas / Ajustes) remembered per browser.

Assumption: reference brand assets/text are not copied; Casa Maderero content and Unsplash photos are used.

## Tasks

| ID | Specs | Route | Status | Evidence |
| -- | ----- | ----- | ------ | -------- |
| T1 | S3 S4 S5 S7 S9 S14 | inline | done (11/11 e2e, live API smoke) | backend: category kind, product sort/filter/ref, article lead/sections, dealer geo/services, complaints API |
| T2 | S1 S15 S16 | inline | done (visual check) | global chrome, 404, cookies |
| T3 | S2 S3 S4 S5 S6 | inline | done (visual check, compare flow) | catalog views + compare |
| T4 | S7 | inline | done (11 pins, Alquiler filter → 3) | dealer locator + map |
| T5 | S8–S14 | inline | done (complaint 400 + 201 live) | content views + complaint form |
| T6 | S1–S16 | inline | done | build, lint, e2e, visual pass |

## Log

- L1 (2026-11-15, user): "si, haz todas las vistas"
- L2: Reference captured with rea (`capture_web_screenshot`) on 13 templates: /c/cortasetos, /ap/gta-40, /products/equipos-herramientas, /busqueda, /tiendas, /profesionales, buenas-practicas article, /noticias, /contact, /preguntas-frecuentes, /manuales-instrucciones, /aviso-legal, libro-de-reclamaciones (returned the reference 404 page, used for S15).
- L3: T1 done. Category.kind, Product.reference, Article.lead/sections, Dealer lat/lng/services/categories, /complaints. Tests written after the code (no RED step observed). Dev DB demo tables truncated and reseeded (newsletter kept).
- L4: T2–T6 done. Checks: frontend oxlint clean + vite build OK; backend eslint clean; e2e 11/11. Visual pass on all 19 routes at 1440px; no horizontal overflow at 375px on any route. Fixed during verification: complaint confirmation always said "reclamo"; contact photo was a payment terminal; sticky tab offset measured (112/157px); mobile compare bar compacted. Lazy images do not load while the Browser pane is hidden (forced eager in checks; not a site bug). Test complaints removed from dev DB.
