# Audit Trail

Append-only log. Captures every change with ISO 8601 timestamps. Never overwritten, only appended.

---

## 2026-06-09T10:00:00Z — Repository Initialization
**Action**: Project scaffolded
**Details**: Initialized bookshop-AIDLC monorepo with backend, frontend, and product-context.

## 2026-06-09T10:00:00Z — Requirements Analysis
**Action**: Requirements documented
**Files**:
- [`01-source/requirements.md`](../01-source/requirements.md) — Functional + non-functional reqs
- [`01-PRODUCT_VISION.md`](../01-PRODUCT_VISION.md) — Product vision
- [`02-REPOSITORY_PURPOSE.md`](../02-REPOSITORY_PURPOSE.md) — Repo purpose

## 2026-06-09T10:00:00Z — Application Design
**Action**: Architecture, contracts, and business rules designed
**Files**:
- [`04-architecture/01-system-design/`](../04-architecture/01-system-design/) — System context, backend arch, frontend arch
- [`06-contracts/01-apis/rest/`](../06-contracts/01-apis/rest/) — OpenAPI specs (books, customers, orders)
- [`02-domain/03-business-rules/`](../02-domain/03-business-rules/) — Book, customer, order rules
- [`05-modules/02-book-management/book-management.md`](../05-modules/02-book-management/book-management.md) — Module spec

## 2026-06-09T10:00:00Z — Backend Implementation
**Action**: Express API built
**Files**:
- [`../../bookshop-backend/src/`](../../bookshop-backend/src/) — Routes, services, validators, database (11 source files)

## 2026-06-09T10:00:00Z — Frontend Implementation
**Action**: React SPA built
**Files**:
- [`../../bookshop-frontend/src/`](../../bookshop-frontend/src/) — Pages, components, hooks, API clients (~35 source files)

## 2026-06-09T10:00:00Z — Design System & Testing Strategy
**Action**: UI design context and testing strategy created
**Files**:
- [`07-design-system/`](../07-design-system/) — UI context, specs, component library
- [`09-testing/strategy/testing-strategy.md`](../09-testing/strategy/testing-strategy.md) — Testing strategy

---

## 2026-06-09T10:34:21Z — Database Design Context
**Action**: Created database design documentation
**Files**:
- [`04-architecture/02-database-design/database-design.md`](../04-architecture/02-database-design/database-design.md) — Schema, ERD, migration plan
**Related**: Removed inline DB schema from backend-architecture.md

## 2026-06-09T10:35:00Z — Sidebar Update
**Action**: Removed Context nav from sidebar
**Files**:
- [`../../bookshop-frontend/src/layouts/Sidebar.tsx`](../../bookshop-frontend/src/layouts/Sidebar.tsx) — Removed DocumentTextIcon import and /context nav
- [`07-design-system/01-foundation/ui-design-context.md`](../07-design-system/01-foundation/ui-design-context.md) — Updated nav items and layout diagram

## 2026-06-09T10:35:30Z — Sprint File Cleanup
**Action**: Removed stale references to deleted 03-backlog/ files across all context docs
**Files**: IMPLEMENTATION-GUIDE.md, README.md, 02-REPOSITORY_PURPOSE.md, testing-strategy.md, book-management.md, backend/frontend READMEs (+ removed 00-START-HERE.md, AI-DLC-PATTERN-SUMMARY.md as redundant)

## 2026-06-09T10:36:00Z — Root README
**Action**: Created project root README with full file map
**Files**:
- [`../../README.md`](../../README.md) — Comprehensive file index

## 2026-06-09T10:37:00Z — AIDLC State & Audit
**Action**: Created AIDLC tracking files
**Files**:
- [`aidlc-state/aidlc-state.md`](../aidlc-state/aidlc-state.md) — Workflow state and requirements traceability
- [`execution/execution.md`](../execution/execution.md) — Execution plan
- [`audit/audit.md`](audit.md) — Append-only audit trail (this file)

## 2026-06-09T12:55:00Z — Categories OpenAPI + Business Rules + Module Spec
**Action**: Created missing context documentation for categories
**Files**:
- [`06-contracts/01-apis/rest/categories.yaml`](../06-contracts/01-apis/rest/categories.yaml) — Full OpenAPI spec (CRUD + 409 conflict responses)
- [`02-domain/03-business-rules/category-rules.md`](../02-domain/03-business-rules/category-rules.md) — BR-CATEGORY-001 through BR-CATEGORY-005
- [`05-modules/02-category-management/category-management.md`](../05-modules/02-category-management/category-management.md) — Module spec
- [`06-contracts/01-apis/rest/books.yaml`](../06-contracts/01-apis/rest/books.yaml) — Added `categoryId` to CreateBookRequest, UpdateBookRequest, BookResponse

## 2026-06-09T13:00:00Z — PostgreSQL Migration
**Action**: Migrated from in-memory Map store to PostgreSQL 16 (Docker)
**Backend**:
- `bookshop-backend/src/db/database.ts` — Restructured with both `InMemoryDatabase` (kept for reference) and `PostgresDatabase` (active), env-based selector (`USE_IN_MEMORY`)
- `bookshop-backend/src/db/schema.sql` — Idempotent schema: categories, books, customers, orders tables + FK constraints + indexes + updated_at trigger
- `bookshop-backend/src/db/seed.ts` — Seed script: 5 categories, 10 books, 4 customers
- `bookshop-backend/.env` — Added PostgreSQL connection config + USE_IN_MEMORY toggle
- `bookshop-backend/package.json` — Added `seed` script
**Context docs updated**:
- [`04-architecture/02-database-design/database-design.md`](../04-architecture/02-database-design/database-design.md) — Documented both implementations, transaction pattern, migration log, environment config
- [`execution/execution.md`](../execution/execution.md) — Updated current sprint to PostgreSQL migration, delivery summary
- [`aidlc-state/aidlc-state.md`](../aidlc-state/aidlc-state.md) — Added N4 for persistent storage, updated doc statuses, next steps
- [`README.md`](../../README.md) — Added new files (schema.sql, seed.ts), PG setup instructions
- [`IMPLEMENTATION-GUIDE.md`](../IMPLEMENTATION-GUIDE.md) — Added PG migration steps

## 2026-06-09T11:00:00Z — Category Feature Implementation
**Action**: Implemented CRUD for book categories
**Backend**:
- `bookshop-backend/src/db/database.ts` — Added `Category` interface, private store, CRUD methods, `findBooksByCategory`
- `bookshop-backend/src/validators/category.validator.ts` — Create + update Zod schemas
- `bookshop-backend/src/services/category.service.ts` — Business logic (unique name, prevent delete if books assigned)
- `bookshop-backend/src/routes/categories.ts` — Full CRUD routes (POST, GET all, GET by ID, PUT, DELETE)
- `bookshop-backend/src/index.ts` — Registered `/api/v1/categories` route, updated docs endpoint
- `bookshop-backend/src/validators/book.validator.ts` — Added `categoryId` to CreateBookSchema and UpdateBookSchema
- `bookshop-backend/src/services/book.service.ts` — Validates category exists on book creation
**Frontend**:
- `bookshop-frontend/src/types/index.ts` — Added `Category` and `CreateCategoryRequest` types, `categoryId` on `Book`/`CreateBookRequest`
- `bookshop-frontend/src/api/categories.api.ts` — API client for categories
- `bookshop-frontend/src/hooks/useCategories.ts` — Categories hook with CRUD
- `bookshop-frontend/src/pages/CategoriesPage.tsx` — Full CRUD page with table, modal, confirm dialog
- `bookshop-frontend/src/App.tsx` — Added `/categories` route
- `bookshop-frontend/src/layouts/Sidebar.tsx` — Added Categories nav item with TagIcon
- `bookshop-frontend/src/pages/BooksPage.tsx` — Added category column, category filter dropdown, category selector in form

## 2026-06-09T14:30:00Z — Four Feature Implementation (Pagination, Stock Movement, Audit Log, Export CSV)
**Action**: Full-stack implementation of pagination, stock movement tracking, audit log, and CSV export
**Backend**:
- `bookshop-backend/src/utils/pagination.ts` — `paginate()` helper wrapping pagination meta
- `bookshop-backend/src/utils/csv.ts` — `generateCsv()` utility
- `bookshop-backend/src/validators/pagination.validator.ts` — `page`/`limit` Zod schemas
- `bookshop-backend/src/db/database.ts` — Added `StockMovement`/`AuditEntry` types, paginated methods (`findAllBooksPaginated`, etc.), stock/audit CRUD, InMemory parity
- `bookshop-backend/src/services/stock.service.ts` — Stock adjustment + history
- `bookshop-backend/src/services/audit.service.ts` — Audit entry queries
- `bookshop-backend/src/services/export.service.ts` — CSV generation per entity
- `bookshop-backend/src/services/book.service.ts` — Paginated `listBooks()`, audit logging on mutations
- `bookshop-backend/src/services/customer.service.ts` — Paginated `listCustomers()`, audit logging on mutations
- `bookshop-backend/src/services/order.service.ts` — Paginated `listOrders()`, stock movement records on creation, audit logging on mutations
- `bookshop-backend/src/routes/stock.routes.ts` — `GET /books/:id/stock-movements`, `POST /books/:id/stock-adjust`
- `bookshop-backend/src/routes/audit.routes.ts` — `GET /audit-log` with filters
- `bookshop-backend/src/routes/export.routes.ts` — `GET /export/:entity?format=csv`
- `bookshop-backend/src/routes/books.ts` — List/search accept `?page=&limit=`
- `bookshop-backend/src/routes/customers.ts` — List/search accept `?page=&limit=`
- `bookshop-backend/src/routes/orders.ts` — List/search accept `?page=&limit=`
- `bookshop-backend/src/index.ts` — Mounted stock, audit, export routes
**Frontend**:
- `bookshop-frontend/src/types/index.ts` — Added `PaginationMeta`, `StockMovement`, `AuditEntry`, `PaginatedResponse<T>`
- `bookshop-frontend/src/api/books.api.ts` — Paginated `getAll()`
- `bookshop-frontend/src/api/customers.api.ts` — Paginated `getAll()`
- `bookshop-frontend/src/api/orders.api.ts` — Paginated `getAll()`
- `bookshop-frontend/src/api/stock.api.ts` — Stock routes client
- `bookshop-frontend/src/api/audit.api.ts` — Audit routes client
- `bookshop-frontend/src/api/export.api.ts` — CSV download client
- `bookshop-frontend/src/hooks/useBooks.ts` — Pagination state (page/totalPages/limit)
- `bookshop-frontend/src/hooks/useCustomers.ts` — Pagination state
- `bookshop-frontend/src/hooks/useOrders.ts` — Pagination state
- `bookshop-frontend/src/hooks/useStockMovements.ts` — Stock movements hook
- `bookshop-frontend/src/hooks/useAuditLog.ts` — Audit log hook
- `bookshop-frontend/src/components/common/Pagination.tsx` — Reusable pagination UI (prev/next, page numbers, page size selector)
- `bookshop-frontend/src/layouts/Sidebar.tsx` — Added Audit Log nav item
- `bookshop-frontend/src/App.tsx` — Added `/audit-log` route
- `bookshop-frontend/src/pages/AuditLogPage.tsx` — Filterable audit log page with expandable JSON diff
- `bookshop-frontend/src/pages/BooksPage.tsx` — Added pagination, Export CSV, stock history modal
- `bookshop-frontend/src/pages/OrdersPage.tsx` — Added pagination, Export CSV
**Build**: Both backend and frontend `npm run build` pass with zero errors
**Context docs**:
- [`feature/feature.md`](../feature/feature.md) — Sections 13-16
- [`01-source/requirements.md`](../01-source/requirements.md) — R11-R20
- [`IMPLEMENTATION-GUIDE.md`](../IMPLEMENTATION-GUIDE.md) — Phases 7-10
- [`04-architecture/02-database-design/database-design.md`](../04-architecture/02-database-design/database-design.md) — `stock_movements` + `audit_log` tables, ERD update, pagination pattern
- [`02-domain/03-business-rules/stock-rules.md`](../02-domain/03-business-rules/stock-rules.md) — Stock rules
- [`02-domain/03-business-rules/audit-rules.md`](../02-domain/03-business-rules/audit-rules.md) — Audit rules
- [`06-contracts/01-apis/rest/stock.yaml`](../06-contracts/01-apis/rest/stock.yaml) — Stock API contract
- [`06-contracts/01-apis/rest/audit.yaml`](../06-contracts/01-apis/rest/audit.yaml) — Audit API contract
- [`06-contracts/01-apis/rest/export.yaml`](../06-contracts/01-apis/rest/export.yaml) — Export API contract
- [`07-design-system/01-foundation/ui-design-context.md`](../07-design-system/01-foundation/ui-design-context.md) — Sidebar nav, Pagination/StockHistoryModal/ExportButton patterns
- [`execution/execution.md`](../execution/execution.md) — Delivery summary + sprint tasks
- [`aidlc-state/aidlc-state.md`](../aidlc-state/aidlc-state.md) — Updated requirements traceability, doc statuses, next steps

## 2026-06-10T07:14:00Z — Book Cover Images + Card View
**Action**: Full-stack implementation of book cover upload (S3) and card/grid view toggle
**Backend**:
- `bookshop-backend/src/utils/supabase.ts` — Rewritten to use @aws-sdk/client-s3 (Supabase S3-compatible endpoint)
- `bookshop-backend/src/routes/upload.routes.ts` — `POST /api/v1/books/:id/cover` with multer file handling, 5MB limit, allowed formats
- `bookshop-backend/src/db/database.ts` — Added `coverUrl` to Book interface, updated Postgres INSERT/UPDATE with cover_url column
- `bookshop-backend/src/db/schema.sql` — Added `cover_url VARCHAR(500)` to books table
- `bookshop-backend/src/validators/book.validator.ts` — Added optional `coverUrl` to Create/Update schemas
- `bookshop-backend/.env` — Added S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET
**Frontend**:
- `bookshop-frontend/src/pages/BooksPage.tsx` — File upload input with preview, card/grid view toggle (ListBulletIcon/Squares2X2Icon), grid card rendering with cover image or initial-letter placeholder
- `bookshop-frontend/src/api/books.api.ts` — Added `uploadCover(bookId, file)` with multipart/form-data
- `bookshop-frontend/src/types/index.ts` — Added `coverUrl` to Book and CreateBookRequest interfaces
**Build**: Both backend and frontend `npm run build` pass with zero errors
**Context docs**:
- [`01-source/requirements.md`](../01-source/requirements.md) — Added Book Cover Images section
- [`IMPLEMENTATION-GUIDE.md`](../IMPLEMENTATION-GUIDE.md) — Added Phase 11
- [`04-architecture/02-database-design/database-design.md`](../04-architecture/02-database-design/database-design.md) — Added cover_url to Book interface, PostgreSQL columns, CREATE TABLE
- [`06-contracts/01-apis/rest/books.yaml`](../06-contracts/01-apis/rest/books.yaml) — Added `/books/{bookId}/cover` endpoint, coverUrl on all book schemas
- [`execution/execution.md`](../execution/execution.md) — Added Current Sprint for Book Cover Images, marked all tasks Done
- [`aidlc-state/aidlc-state.md`](../aidlc-state/aidlc-state.md) — Updated requirements traceability, doc statuses
- [`guardrail/guardrail.md`](../guardrail/guardrail.md) — Added New Feature Workflow (8 gates)

## 2026-06-10T08:00:00Z — UI Design Polish
**Action**: Applied visual refresh across the frontend — brand gradient palette, component polish, shimmer skeletons
**Files**:
- [`../../bookshop-frontend/tailwind.config.js`](../../bookshop-frontend/tailwind.config.js) — Added `brand` colors, `shadow-modal`, shimmer keyframe/animation, enhanced `card-hover` shadow
- [`../../bookshop-frontend/src/index.css`](../../bookshop-frontend/src/index.css) — Added `.shimmer` utility class (gradient sweep skeleton)
- [`../../bookshop-frontend/src/layouts/Sidebar.tsx`](../../bookshop-frontend/src/layouts/Sidebar.tsx) — Gradient logo, left-border active indicator, user avatar section
- [`../../bookshop-frontend/src/components/common/Card.tsx`](../../bookshop-frontend/src/components/common/Card.tsx) — Hover lift effect (scale + border transition)
- [`../../bookshop-frontend/src/components/common/Modal.tsx`](../../bookshop-frontend/src/components/common/Modal.tsx) — Backdrop blur, modal shadow
- [`../../bookshop-frontend/src/components/common/Button.tsx`](../../bookshop-frontend/src/components/common/Button.tsx) — Gradient primary, icon slide animation, group hover
- [`../../bookshop-frontend/src/layouts/PageHeader.tsx`](../../bookshop-frontend/src/layouts/PageHeader.tsx) — Lighter typography (semibold + tracking-tight), softer border
- [`../../bookshop-frontend/src/components/common/SearchInput.tsx`](../../bookshop-frontend/src/components/common/SearchInput.tsx) — Rounded-full pill style with shadow
- [`../../bookshop-frontend/src/pages/HomePage.tsx`](../../bookshop-frontend/src/pages/HomePage.tsx) — Shimmer skeletons, gradient hero icon, card hover on stats
**Context docs**:
- [`01-source/requirements.md`](../01-source/requirements.md) — Added UI Design Polish requirements
- [`execution/execution.md`](../execution/execution.md) — Added UI Design Polish sprint with 11 tasks
- [`IMPLEMENTATION-GUIDE.md`](../IMPLEMENTATION-GUIDE.md) — Added Phase 12 with detailed implementation steps
- [`07-design-system/01-foundation/ui-design-context.md`](../07-design-system/01-foundation/ui-design-context.md) — Updated to v2.1: brand gradient tokens, new shadows, shimmer utility, updated component specs
**Build**: Frontend `npm run build` passes with zero errors

## 2026-06-10T08:30:00Z — UI Polish Fix (animate-shimmer in @apply)
**Action**: Fixed runtime CSS error
**Error**: `animate-shimmer` class not found when used inside `@layer components @apply` — Tailwind cannot resolve custom animation utilities inside layer `@apply` directives
**Fix**: Replaced `@apply animate-shimmer` with inline `animation: shimmer 1.5s ease-in-out infinite` + `background-size: 200% 100%` in `index.css`
**Verification**: `npm run build` passes, compiled CSS contains `.shimmer` class with correct animation properties
