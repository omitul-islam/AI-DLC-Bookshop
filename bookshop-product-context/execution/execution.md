# Execution Plan

## Stages to Execute
- [x] Requirements Analysis — always runs
- [x] Application Design — complexity warrants it
- [x] Units Generation — implementation complete

---

## Delivery Summary

All requirements from [`requirements.md`](../01-source/requirements.md) are implemented across backend API and frontend SPA.

| Scope | Backend | Frontend | Contracts |
|-------|---------|----------|-----------|
| Book Management | 5 endpoints (CRUD + search, categoryId field) | CRUD UI with search + category filter | [`books.yaml`](../06-contracts/01-apis/rest/books.yaml) |
| Category Management | 5 endpoints (CRUD) | CRUD UI | [`categories.yaml`](../06-contracts/01-apis/rest/categories.yaml) |
| PostgreSQL Migration | 6 entities, 6 tables, FK constraints | — | [`schema.sql`](../../bookshop-backend/src/db/schema.sql) |
| Customer Management | 2 endpoints (add, list) | Add/list UI | [`customers.yaml`](../06-contracts/01-apis/rest/customers.yaml) |
| Order Management | 2 endpoints (create, status) | Create/list/status UI | [`orders.yaml`](../06-contracts/01-apis/rest/orders.yaml) |
| Pagination | Offset-based pagination on all list endpoints | Pagination component with page controls | — |
| Stock Movement Log | `stock_movements` table, record + adjust + view endpoints | Stock history modal, dashboard card | — |
| Audit Log | `audit_log` table, auto-log on all CRUD, filtered view endpoint | Audit log page with filter bar + table | — |
| Export CSV | CSV export endpoint per entity with BOM | Export CSV buttons on list pages | — |
| Book Cover Images | S3 upload endpoint (file → Supabase Storage → URL) | Card/grid view toggle, file upload in modal, cover display | — |
| Monthly Sales Analytics | `GET /api/v1/analytics/sales-by-month` aggregation endpoint | MonthlySalesPanel on HomePage, month drill-down on OrdersPage | [`analytics.yaml`](../06-contracts/01-apis/rest/analytics.yaml) |

---

## Current Sprint — Pagination, Stock Log, Audit Log, Export CSV

| # | Task | Status |
|---|------|--------|
| P1 | Pagination utility + validator schema | ✅ Done |
| P2 | Update repository methods with OFFSET/LIMIT + COUNT | ✅ Done |
| P3 | Update services and routes for paginated responses | ✅ Done |
| P4 | Frontend Pagination component | ✅ Done |
| P5 | Frontend hooks + API module updates for pagination | ✅ Done |
| S1 | `stock_movements` table migration + types | ✅ Done |
| S2 | Repository methods (record, get, adjust) | ✅ Done |
| S3 | Stock service + routes | ✅ Done |
| S4 | Integrate stock recording into order creation | ✅ Done |
| S5 | Frontend stock history modal + dashboard card | ✅ Done |
| A1 | `audit_log` table migration + types | ✅ Done |
| A2 | Repository methods (create, filter query) | ✅ Done |
| A3 | Audit service + routes | ✅ Done |
| A4 | Wire audit logging into all existing services | ✅ Done |
| A5 | Frontend Audit Log page with filters + table | ✅ Done |
| E1 | CSV utility + export service | ✅ Done |
| E2 | Export route per entity (books, customers, orders) | ✅ Done |
| E3 | Frontend Export CSV buttons on list pages | ✅ Done |

## Current Sprint — Book Cover Images + Card View

| # | Task | Status |
|---|------|--------|
| C1 | Switch from Supabase SDK to @aws-sdk/client-s3 | ✅ Done |
| C2 | Add S3 env vars + create S3 client utility | ✅ Done |
| C3 | Update upload route to use S3 SDK | ✅ Done |
| C4 | Remove cover URL text field from book form | ✅ Done |
| C5 | Add file upload input + preview in book modal | ✅ Done |
| C6 | Card/grid view on BooksPage with cover display | ✅ Done |
| C7 | Update API contracts (books.yaml) for upload endpoint | ✅ Done |
| C8 | Update database-design.md with cover_url field | ✅ Done |

---

## Current Sprint — UI Design Polish

| # | Task | Status |
|---|------|--------|
| U1 | Update tailwind config with brand gradient palette + new shadows/animations | ⬜ Pending |
| U2 | Update index.css with shimmer keyframe + backdrop-blur utilities | ⬜ Pending |
| U3 | Rebrand sidebar: gradient logo area, left-border active indicator, user avatar section | ⬜ Pending |
| U4 | Update Card component with hover lift effect (scale + border transition) | ⬜ Pending |
| U5 | Update Modal component with backdrop-blur-sm overlay | ⬜ Pending |
| U6 | Update Button component with icon slide animation on hover | ⬜ Pending |
| U7 | Update PageHeader with lighter typography + tracking | ⬜ Pending |
| U8 | Update SearchInput to rounded-full pill style | ⬜ Pending |
| U9 | Replace animate-pulse skeletons with shimmer gradient on HomePage | ⬜ Pending |
| U10 | Apply brand gradient to primary buttons, page header accents, stats card icons | ⬜ Pending |
| U11 | Update ui-design-context.md with all new design tokens | ⬜ Pending |

---

## Current Sprint — Shopping Cart

| # | Task | Status |
|---|------|--------|
| CT1 | Create cart types (`CartItem`, `Cart`) + localStorage utility hook | ✅ Done |
| CT2 | Add "Add to Cart" button on BooksPage (list + grid views) | ✅ Done |
| CT3 | Create CartDrawer component (slide-out from right with backdrop) | ✅ Done |
| CT4 | Create cart summary section (items, qty controls, subtotal, total) | ✅ Done |
| CT5 | Add cart icon with item count badge to sidebar | ✅ Done |
| CT6 | Wire toast notifications for add/remove/clear cart actions | ✅ Done |
| CT7 | Backend: `POST /api/v1/cart/validate` endpoint (stock check) | ✅ Done |
| CT8 | Backend: `POST /api/v1/cart/checkout` endpoint (cart → order, stock deduction, stock movement + audit log) | ✅ Done |
| CT9 | Update OpenAPI contracts for cart endpoints | ✅ Done |
| CT10 | Update database-design.md if schema changes | ✅ Done |

## Current Sprint — BookHouse Rebrand

| # | Task | Status |
|---|------|--------|
| R1 | Create vintage badge SVG logo component | ✅ Done |
| R2 | Replace sidebar "B" logo with badge + rename "Bookshop" → "BookHouse" | ✅ Done |
| R3 | Update all page titles from "Bookshop Management" → "BookHouse" | ✅ Done |
| R4 | Update index.html title + favicon | ✅ Done |
| R5 | Update design context docs with new brand name | ✅ Done |

---

## Current Sprint — Favourites

| # | Task | Status |
|---|------|--------|
| F1 | Create `useFavorites` hook (localStorage) | ✅ Done |
| F2 | Create `FavoritesContext` for shared state + toast | ✅ Done |
| F3 | Add heart toggle to BooksPage (list + grid views) | ✅ Done |
| F4 | Create Favourites page with checkbox selection + "Add Selected to Cart" | ✅ Done |
| F5 | Add Favourites nav item to sidebar with count badge | ✅ Done |
| F6 | Wire Favourites → Cart flow (add selected to cart) | ✅ Done |
| F7 | Guardrail: verify build + application run check | ✅ Done |
| F8 | Add batch remove selected + clear all favourites | ✅ Done |

---

## Current Sprint — Monthly Sales Analytics Panel

| # | Task | Status |
|---|------|--------|
| M1 | Add requirements to `01-source/requirements.md` | ✅ Done |
| M2 | Update `execution/execution.md` with sprint plan | ✅ Done |
| M3 | Backend: create `GET /api/v1/analytics/sales-by-month` endpoint (aggregate orders by month, total revenue, book count, order count, avg order value, top book per month, trend vs prev month) | ✅ Done |
| M4 | Backend: update orders route to support `?month=2026-04` filter for drill-down | ✅ Done |
| M5 | Frontend: add `analytics.api.ts` with API call + hook | ✅ Done |
| M6 | Frontend: build Monthly Sales panel on HomePage (summary bar + table with trend arrows) | ✅ Done |
| M7 | Frontend: wire month row click → navigate to orders page filtered by that month | ✅ Done |
| M8 | Update API contracts (`analytics.yaml`) | ✅ Done |
| M9 | Update business rules if needed | ✅ Done (no new rules needed) |
| M10 | Guardrail: verify build + application run check | ✅ Done |

---

## Future Work

| Priority | Item | Depends On |
|----------|------|------------|
| High | Authentication & authorization | — |
| Medium | Unit & integration tests | Testing strategy |
| Medium | Prisma ORM migration | — |
| Low | Production deployment | Auth |
