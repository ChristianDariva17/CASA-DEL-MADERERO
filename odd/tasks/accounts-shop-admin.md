# Accounts, online shop and admin panel

Objective: one login that sends admins to a custom admin panel and customers to their purchase area (cart, checkout with online payment, orders). Not a git repo → no commits.
Delivery: single local change. Runner: backend `npm run test:e2e` + eslint; frontend `npm run build` + `oxlint` + visual check.

## Specs

- S1 "quiero que el login direccione a dos vistas. uno para administrar y otro para cliente cuando va realizar una compra. el panel será propio". One `/ingresar` page: role `admin` lands on `/admin`, role `customer` lands on `/mi-cuenta` (or back to the checkout it came from). Customers can register at `/registro`; admins cannot self-register (seeded from env).
- S2 Auth: email + password (bcrypt hash), JWT bearer with role claim, `GET /auth/me`. Admin routes require role `admin` on the server (403 otherwise, 401 without token); the frontend guards are convenience only.
- S3 Purchase (user choice: "Pago online"): cart (localStorage, product + optional variant + quantity) → checkout form (shipping data) → order created server-side with prices taken from the DB, never from the client → payment.
- S4 Payment gateway (user choice: "Todavía no sé"): build everything behind a payment gateway interface with a simulated provider (approve/reject screen). A real gateway (Mercado Pago, Culqi, Niubiz) plugs in later without rewriting orders.
- S5 Customer area `/mi-cuenta`: profile and order history with status.
- S6 Admin panel `/admin` (own layout, not the public header): dashboard counts; CRUD for products, categories, articles and dealers; orders list with status changes; complaints list (read-only).

Assumptions: token kept in localStorage (simple; an httpOnly cookie is safer against XSS and is noted as follow-up). Hardcoded frontend content (sectors, events, FAQ, legal) stays in code for now. Variants are not editable from the panel in this iteration.

## Tasks

| ID | Specs | Route | Status | Evidence |
| -- | ----- | ----- | ------ | -------- |
| T1 | S1 S2 | inline | done (auth e2e: register/login/me/401/403) | users, auth module, guards, admin seed |
| T2 | S3 S4 S5 | inline | done (server pricing, owner-only, pay-once e2e) | orders module, payment port, simulated gateway |
| T3 | S6 | inline | done (CRUD, slug 409, category-in-use 409, summary e2e) | admin API |
| T4 | S1 S3 S4 S5 | inline | done (browser: cart → login redirect → register → checkout → pay → order) | auth context, login/register, cart, checkout, account |
| T5 | S6 | inline | done (browser: admin login → /admin, product edit, article round-trip) | admin panel UI |
| T6 | S1–S6 | inline + delegated verifier | done (verifier: no blockers; 4 should-fix applied; e2e 30/30) | tests, builds, visual pass, independent verifier (Risk item 2: auth) |

## Log

- L1 (2026-11-15, user): "quiero que el login direccione a dos vistas. uno para administrar y otro para cliente cuando va realizar una compra. el panel será propio"
- L2 (2026-11-15, user answers): purchase closes with "Pago online"; gateway "Todavía no sé" → simulated provider behind an interface.
- L3: Backend e2e 28/28 (12 new against a real Postgres test DB). Frontend oxlint clean, build OK. Browser pass: customer flow end to end, customer bounced from /admin to /mi-cuenta, admin lands on /admin, product price edit reflected in public API, no overflow at 375px on admin pages. `.env` files are permission-denied for the agent: API run with env vars from a scratchpad file; user must add JWT_SECRET and ADMIN_* to backend/.env.
- L4: Bug found in browser pass and fixed: saving an unchanged article regenerated section ids (broke "#resumen" anchors). Drafts now keep the existing id; article restored.
- L5: Independent verifier (Risk item 2): S1 S2 S5 S6 met, S3 S4 partial, no blockers. Applied in one correction batch: simulated gateway chosen via PAYMENT_PROVIDER and refused under NODE_ENV=production, plus a per-order provider check; TRUST_PROXY for the rate limit + a 429 test; variant required when a product has variants; nulls in admin PATCH ignored (except image/coords); price minimum 0.01; reopening an order clears paidAt. Recheck: e2e 30/30, eslint clean. Browser test customer and order deleted from the dev DB; dev admin kept.
- Open follow-ups: httpOnly cookie instead of localStorage; per-account login throttling (counters are in memory, per IP); real payment gateway; editing variants and the hardcoded content (sectors, events, FAQ, legal) from the panel; TypeORM migrations before production.
