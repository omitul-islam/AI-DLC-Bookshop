# Bookshop Management System — AIDLC

Full-stack bookshop management app: inventory, customers, and order processing.

---

## Project Structure

### `bookshop-backend/` — Express API (TypeScript)
File | Purpose
-----|--------
[`src/index.ts`](bookshop-backend/src/index.ts) | Express app entry, route mounting, health check
[`src/db/database.ts`](bookshop-backend/src/db/database.ts) | Database layer — `InMemoryDatabase` (reference) + `PostgresDatabase` (active), env-based selector
[`src/db/schema.sql`](bookshop-backend/src/db/schema.sql) | PostgreSQL schema (4 tables, FK constraints, indexes, triggers)
[`src/db/seed.ts`](bookshop-backend/src/db/seed.ts) | Seed script — 5 categories, 10 books, 4 customers
[`src/routes/books.ts`](bookshop-backend/src/routes/books.ts) | Book CRUD endpoints
[`src/routes/categories.ts`](bookshop-backend/src/routes/categories.ts) | Category CRUD endpoints
[`src/routes/customers.ts`](bookshop-backend/src/routes/customers.ts) | Customer endpoints
[`src/routes/orders.ts`](bookshop-backend/src/routes/orders.ts) | Order create/list/status endpoints
[`src/services/book.service.ts`](bookshop-backend/src/services/book.service.ts) | Book business logic (category validation)
[`src/services/category.service.ts`](bookshop-backend/src/services/category.service.ts) | Category business logic (unique name, protect delete)
[`src/services/customer.service.ts`](bookshop-backend/src/services/customer.service.ts) | Customer business logic
[`src/services/order.service.ts`](bookshop-backend/src/services/order.service.ts) | Order business logic (stock validation, totalPrice)
[`src/validators/book.validator.ts`](bookshop-backend/src/validators/book.validator.ts) | Zod schemas for book rules (including categoryId)
[`src/validators/category.validator.ts`](bookshop-backend/src/validators/category.validator.ts) | Zod schemas for category rules
[`src/validators/customer.validator.ts`](bookshop-backend/src/validators/customer.validator.ts) | Zod schemas for customer rules
[`src/validators/order.validator.ts`](bookshop-backend/src/validators/order.validator.ts) | Zod schemas for order rules
[`TEST-API.md`](bookshop-backend/TEST-API.md) | Manual curl test guide
[`package.json`](bookshop-backend/package.json) | Dependencies & scripts

### `bookshop-frontend/` — React SPA (TypeScript + Vite + Tailwind)
File | Purpose
-----|--------
[`src/App.tsx`](bookshop-frontend/src/App.tsx) | Router setup (/, /books, /categories, /customers, /orders)
[`src/main.tsx`](bookshop-frontend/src/main.tsx) | App entry point
[`src/index.css`](bookshop-frontend/src/index.css) | Global styles + Tailwind
[`src/types/index.ts`](bookshop-frontend/src/types/index.ts) | Book, Customer, Order, Category interfaces
[`src/api/client.ts`](bookshop-frontend/src/api/client.ts) | Axios instance with interceptors
[`src/api/books.api.ts`](bookshop-frontend/src/api/books.api.ts) | Book API calls
[`src/api/categories.api.ts`](bookshop-frontend/src/api/categories.api.ts) | Category API calls
[`src/api/customers.api.ts`](bookshop-frontend/src/api/customers.api.ts) | Customer API calls
[`src/api/orders.api.ts`](bookshop-frontend/src/api/orders.api.ts) | Order API calls
[`src/hooks/useBooks.ts`](bookshop-frontend/src/hooks/useBooks.ts) | Book state management
[`src/hooks/useCategories.ts`](bookshop-frontend/src/hooks/useCategories.ts) | Category state management
[`src/hooks/useCustomers.ts`](bookshop-frontend/src/hooks/useCustomers.ts) | Customer state management
[`src/hooks/useOrders.ts`](bookshop-frontend/src/hooks/useOrders.ts) | Order state management
[`src/pages/HomePage.tsx`](bookshop-frontend/src/pages/HomePage.tsx) | Dashboard (stats: total books, total value, low stock)
[`src/pages/BooksPage.tsx`](bookshop-frontend/src/pages/BooksPage.tsx) | Book CRUD UI (with category filter/selector)
[`src/pages/CategoriesPage.tsx`](bookshop-frontend/src/pages/CategoriesPage.tsx) | Category CRUD UI
[`src/pages/CustomersPage.tsx`](bookshop-frontend/src/pages/CustomersPage.tsx) | Customer management UI
[`src/pages/OrdersPage.tsx`](bookshop-frontend/src/pages/OrdersPage.tsx) | Order creation/listing with totalPrice
[`src/layouts/Sidebar.tsx`](bookshop-frontend/src/layouts/Sidebar.tsx) | Navigation sidebar
[`src/layouts/MainLayout.tsx`](bookshop-frontend/src/layouts/MainLayout.tsx) | App shell layout
[`src/layouts/PageHeader.tsx`](bookshop-frontend/src/layouts/PageHeader.tsx) | Reusable page header
[`src/components/common/`](bookshop-frontend/src/components/common/) | Reusable: Button, Card, Modal, Table, Input, Select, StatusBadge, Alert, Spinner, EmptyState, ConfirmDialog, SearchInput, IconButton
[`src/context/ToastContext.tsx`](bookshop-frontend/src/context/ToastContext.tsx) | Toast notification context
[`tailwind.config.js`](bookshop-frontend/tailwind.config.js) | Tailwind theme (colors, fonts, shadows)
[`vite.config.ts`](bookshop-frontend/vite.config.ts) | Vite build config
[`package.json`](bookshop-frontend/package.json) | Dependencies & scripts

### `bookshop-product-context/` — AI-DLC Documentation
File | Purpose
-----|--------
[`01-PRODUCT_VISION.md`](bookshop-product-context/01-PRODUCT_VISION.md) | Product vision
[`02-REPOSITORY_PURPOSE.md`](bookshop-product-context/02-REPOSITORY_PURPOSE.md) | Repo purpose
[`02-domain/01-overview/glossary.md`](bookshop-product-context/02-domain/01-overview/glossary.md) | Domain term definitions
[`02-domain/03-business-rules/book-rules.md`](bookshop-product-context/02-domain/03-business-rules/book-rules.md) | Book business rules (BR-BOOK-001–009)
[`02-domain/03-business-rules/category-rules.md`](bookshop-product-context/02-domain/03-business-rules/category-rules.md) | Category business rules (BR-CATEGORY-001–005)
[`02-domain/03-business-rules/customer-rules.md`](bookshop-product-context/02-domain/03-business-rules/customer-rules.md) | Customer business rules
[`02-domain/03-business-rules/order-rules.md`](bookshop-product-context/02-domain/03-business-rules/order-rules.md) | Order business rules (BR-ORDER-001–010)
[`04-architecture/01-system-design/system-context.md`](bookshop-product-context/04-architecture/01-system-design/system-context.md) | C4 Level 1 system context
[`04-architecture/01-system-design/backend-architecture.md`](bookshop-product-context/04-architecture/01-system-design/backend-architecture.md) | Backend architecture
[`04-architecture/01-system-design/frontend-architecture.md`](bookshop-product-context/04-architecture/01-system-design/frontend-architecture.md) | Frontend architecture
[`04-architecture/02-database-design/database-design.md`](bookshop-product-context/04-architecture/02-database-design/database-design.md) | Data models, ERD, PostgreSQL schema, migration log, env config
[`05-modules/02-book-management/book-management.md`](bookshop-product-context/05-modules/02-book-management/book-management.md) | Book module specification
[`05-modules/02-category-management/category-management.md`](bookshop-product-context/05-modules/02-category-management/category-management.md) | Category module specification
[`06-contracts/01-apis/rest/books.yaml`](bookshop-product-context/06-contracts/01-apis/rest/books.yaml) | OpenAPI — Books (includes categoryId)
[`06-contracts/01-apis/rest/categories.yaml`](bookshop-product-context/06-contracts/01-apis/rest/categories.yaml) | OpenAPI — Categories (CRUD + conflict responses)
[`06-contracts/01-apis/rest/customers.yaml`](bookshop-product-context/06-contracts/01-apis/rest/customers.yaml) | OpenAPI — Customers
[`06-contracts/01-apis/rest/orders.yaml`](bookshop-product-context/06-contracts/01-apis/rest/orders.yaml) | OpenAPI — Orders
[`06-contracts/03-events/book-events.yaml`](bookshop-product-context/06-contracts/03-events/book-events.yaml) | Event schemas
[`07-design-system/01-foundation/ui-design-context.md`](bookshop-product-context/07-design-system/01-foundation/ui-design-context.md) | UI design system spec
[`07-design-system/01-foundation/ui-specifications.md`](bookshop-product-context/07-design-system/01-foundation/ui-specifications.md) | UI component specs
[`07-design-system/02-components/component-library.md`](bookshop-product-context/07-design-system/02-components/component-library.md) | Component library
[`08-development-guides/01-backend/README.md`](bookshop-product-context/08-development-guides/01-backend/README.md) | Backend dev guide
[`09-testing/strategy/testing-strategy.md`](bookshop-product-context/09-testing/strategy/testing-strategy.md) | Testing strategy
[`guardrail/guardrail.md`](bookshop-product-context/guardrail/guardrail.md) | Development guardrails
[`IMPLEMENTATION-GUIDE.md`](bookshop-product-context/IMPLEMENTATION-GUIDE.md) | Step-by-step implementation guide

---

## AIDLC Tracking
File | Purpose
-----|--------
[`aidlc-state/aidlc-state.md`](aidlc-state/aidlc-state.md) | Workflow state & requirements traceability
[`execution/execution.md`](execution/execution.md) | Execution plan & delivery summary
[`audit/audit.md`](audit/audit.md) | Append-only audit trail

---

## Prerequisites

- **Node.js** 20+ 
- **Docker** (for PostgreSQL) — or set `USE_IN_MEMORY=true` to skip

## Setup

### 1. Start PostgreSQL (Docker)

```bash
docker run -d --name bookshop-pg \
  -e POSTGRES_USER=bookshop \
  -e POSTGRES_PASSWORD=bookshop \
  -e POSTGRES_DB=bookshop \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Initialize Database Schema

```bash
docker exec -i bookshop-pg psql -U bookshop -d bookshop < bookshop-backend/src/db/schema.sql
```

### 3. Seed Sample Data (optional)

```bash
cd bookshop-backend && npm run seed
```

### 4. Start the Backend

```bash
cd bookshop-backend && npm install && npm run dev
# → http://localhost:3000
```

### 5. Start the Frontend (separate terminal)

```bash
cd bookshop-frontend && npm install && npm run dev
# → http://localhost:5173
```

### Without Docker (In-Memory Mode)

Skip steps 1–3 and start the backend with in-memory storage:

```bash
cd bookshop-backend && USE_IN_MEMORY=true npm run dev
```

> Note: Data will reset on every restart in in-memory mode.
