# Admin panel: variants, image upload and site content

Objective: close the panel gaps left open by `accounts-shop-admin`: edit product variants, upload images instead of pasting URLs, and edit the content that was hardcoded in the frontend (sectors, events, FAQ, legal pages). Not a git repo → no commits.
Delivery: single local change. Runner: backend `npm run test:e2e` + eslint; frontend `npm run build` + `oxlint` + visual check.

## Specs

- S1 "vamos por el tema de panel" (answering the open follow-ups: "Editar variantes de producto", "Editar desde el panel el contenido que está fijo en el código: sectores, eventos, FAQ y textos legales", "Subir imágenes. Hoy se cargan pegando una URL").
- S2 Variants: the product form lists its variants (label, reference, price) and can add, edit, remove and reorder them. Saving replaces the product's variant set; existing ids are kept so past order data stays meaningful. A variant needs label and price > 0.
- S3 Image upload: every image field in the panel offers "Subir imagen" next to the URL input. Admin-only `POST /api/admin/uploads` accepts JPEG, PNG or WebP up to 5 MB (content checked by magic bytes, not just the declared type), stores it under `backend/uploads/` with a random name and returns its URL `/api/uploads/<name>`. Image fields accept that relative URL or an http(s) URL.
- S4 Site content: sectors, events, FAQ groups and legal pages move to the database, seeded with today's hardcoded texts when their table is empty, served by public read endpoints and editable from new panel sections. Public pages render from the API with the same look. FAQ answers and legal bodies use a small text format: blank line between paragraphs, "- " bullets, `[texto](/ruta)` links, `**negrita**`.

Assumptions: uploaded files live on the local disk (a deploy needs a persistent volume or object storage later). Unused uploads are not garbage-collected.

## Tasks

| ID | Specs | Route | Status | Evidence |
| -- | ----- | ----- | ------ | -------- |
| T1 | S2 | inline | done (e2e: order + kept ids, untouched when omitted, invalid/foreign 400, create + clear; browser edit/reorder saved) | `admin/dto.ts` VariantDto, `admin.module.ts` replaceVariants, FormField VariantsEditor |
| T2 | S3 | inline | done (e2e: 401/403, PNG stored + served with nosniff, fake PNG 400, >5 MB 413, image path accepted, other schemes 400; browser upload + preview) | `content/uploads.ts`, ImageField |
| T3 | S4 | inline | done (e2e: seed once without overwrite, public endpoints, admin-only, CRUD per type, validation messages; browser: legal, FAQ, sector, events render from API) | `content/*`, RichText, public pages, 4 panel sections |
| T4 | S1–S4 | inline + delegated verifier | done (verifier: no blockers, S1–S4 met; 1 should-fix + 1 nit applied with probes; e2e 45/45) | tests, builds, browser pass, independent verifier (Risk item 2: uploads) |

## Log

- L1 (2026-11-16, user): "vamos por el tema de panel"
- L2: RED observed (suite failed to compile: missing content module). GREEN: admin-panel e2e 15/15, full e2e 45/45 (Postgres suites now share `test/db.ts` and run with maxWorkers 1).
- L3: Browser pass with a temporary admin (deleted afterwards): CM 250 variant price edit + reorder saved with ids kept, then restored to its original values via PATCH; sector image upload through the Vite proxy shows its preview, form cancelled and test file deleted; no horizontal overflow at 375 px. The FAQ hash jump looked broken only because the site's `scroll-behavior: smooth` does not animate in the agent's browser pane; an instant scrollIntoView lands on the section.
- L4: Seed texts updated where the shop made them outdated: FAQ "¿Dónde puedo comprar…?" now mentions the online shop, "¿Los precios… son finales?" now says prices include IGV, privacy text mentions orders.
- L5: Independent verifier: no blockers, S1–S4 met. Applied in one correction batch: links starting with "/\" (browsers treat it as "//", another site) are rejected by the event link validator and rendered as plain text by RichText / EventsPage (shared `components/ui/links.ts`); a repeated variant id now returns 400 "Una variante aparece repetida". Both probes added as e2e cases. Recheck: e2e 45/45, eslint/tsc clean, frontend tsc + oxlint + build clean. Verifier scratch dir removed.
- Open follow-ups: uploaded files are not garbage-collected; a deploy needs a persistent volume (or object storage) for `UPLOAD_DIR`, and the frontend must serve `/api` on the same origin for `/api/uploads/...` paths.
