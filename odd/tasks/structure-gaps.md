# Structure gaps vs. stihl.pe

Objective: close the remaining structural differences with the reference (filters, variants, page endings, sector and campaign subpages) using Casa Maderero content. Not a git repo → no commits.
Delivery: single local change. Runner: backend `npm run test:e2e`; frontend `npm run build` + `oxlint` + visual check.

## Specs

- S1 Category filters are facets defined per category with option counts, like the reference: Motosierras → Accionamiento, Grupo de usuarios, Potencia, Peso, Longitud de la espada; Cortasetos → Accionamiento, Sistema a batería, Grupo de usuarios, Peso, Longitud de corte. Numeric facets use range buckets ("Hasta 4.0 kg (2)", "4.1 kg a 5.0 kg (6)"). Multiple options in one facet are OR, facets combine with AND. Search keeps Accionamiento + Precio + Categoría.
- S2 Product variants: the gray "name + Ref." box becomes a "Selecciona el artículo" dropdown when a product has several articles; choosing one updates reference and price. The technical table shows 5 rows and a "Mostrar todo" toggle.
- S3 Product page ending: "Productos similares" on a gray band with compact cards (image, name, orange arrow) and "Servicio y consejos" with three columns (Instrucciones de uso, FAQ, Guía de tallas) and dark buttons; a Guía de tallas page exists.
- S4 Área profesional ending: gray "Encuentra tu tienda … más cercana" band, "Descubre Casa Maderero en ferias y eventos" block, "Más información sobre el mundo Casa Maderero" tiles (orange text tile + photo tiles).
- S5 Home follows the reference order: hero + category strip, competition teaser ("Un escenario…" with "Mira la transmisión"), 4 teaser cards, battery block, new products, "Actual: noticias y promociones", Buenas prácticas (intro card + articles), "Mundo Casa Maderero" tiles, range intro with "Leer más".
- S6 Sector pages `/profesional/:sector` (forestal, jardineria-paisajismo, soluciones-bateria): title, intro, "Máquinas …" 3 category links, store CTA band, fairs/events block, "Máquinas … y accesorios" product cards, safety block, "Protégete…", "Más servicios" 4 tiles.
- S7 Events and campaigns: `/ferias-y-eventos` list, `/experiencia/copa-de-hacheros` competition page (title, intro, image, ↓ TOC, events/history/disciplines sections), `/campanas/aniversario` campaign page (banner, steps, prizes, terms, CTA).

Assumption: event, campaign and competition content is invented demo content for Casa Maderero.

## Tasks

| ID | Specs | Route | Status | Evidence |
| -- | ----- | ----- | ------ | -------- |
| T1 | S1 S2 | inline | done (facets/variants live; 4 new facet tests) | attributes, facets API, variants |
| T2 | S1 S2 S3 | inline | done (5→1 filter flow, variant ref/price, 5→8 spec rows) | listing facets, variant select, product ending, size guide |
| T3 | S4 S5 | inline | done (home order matches reference) | profesional ending, home order |
| T4 | S6 S7 | inline | done (sector sections match reference) | sector, events, competition, campaign pages |
| T5 | S1–S7 | inline | done | tests, build, visual pass |

## Log

- L1 (2026-11-15, user): "haz esto: Lo que sí puedo hacer es cerrar los huecos de estructura: los filtros que faltan, las variantes de producto, el final de las páginas largas y las subpáginas de sector y campañas."
- L2: Reference captured with rea at 1440×7000 (ms-261, profesionales, forestal, jardinería, soluciones-batería, timbersports). Home timed out and the 100-years campaign exceeded rea's 10 MB response limit; their structure was read as page text instead. Filter facets read from the reference DOM.
- L3: All tasks done. Checks: frontend oxlint clean + build OK; backend eslint clean; e2e 15/15 (facet tests written after the code). 14 new/changed routes render at 375px without overflow; unknown sector/campaign slugs show 404. Added full spec sheets so "Mostrar todo" is exercised. Replaced a seed photo that showed the STIHL logo. Dev DB demo tables truncated and reseeded twice (newsletter/complaints kept).
