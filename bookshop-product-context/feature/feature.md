# Features

## 1. Book Management
- **CRUD Operations**: Add, view, update, delete books
- **Search**: Case-insensitive partial-match search by title or author
- **Category Filtering**: Filter books by category
- **Fields**: title, author, price, stock, categoryId, createdAt, updatedAt

## 2. Category Management
- **CRUD Operations**: Add, view, update, delete categories
- **Uniqueness**: Category names are case-insensitive unique (409 on duplicate)
- **Delete Protection**: Cannot delete category with assigned books (409 Conflict)
- **Fields**: name, description, createdAt, updatedAt

## 3. Customer Management
- **CRUD Operations**: Add, view, update, delete customers
- **Search**: Case-insensitive partial-match by name, email, or phone
- **Uniqueness**: Email is case-insensitive unique
- **Validations**: Email format, phone format (regex), name length
- **Fields**: name, email, phone, optional address, createdAt, updatedAt

## 4. Order Management
- **Order Creation**: Links customer + book + quantity with auto stock deduction in a DB transaction
- **Stock Validation**: Rejects order if requested quantity exceeds available stock
- **Automatic totalPrice Calculation**: quantity × book.price
- **Order Status Workflow**: pending → shipped → delivered (with transition validation)
- **Order Filtering**: Filter by status and/or customerId
- **Fields**: customerId, bookId, quantity, totalPrice, status, createdAt, updatedAt

## 5. Dashboard (Frontend)
- **Stats Cards**: Total Books, Out of Stock, Low Stock (<5), Total Inventory Value
- **Recent Books**: Last 5 added books with links
- **Low Stock Alerts**: Books with stock <5, highlighted with restock link
- **Empty/Error/Loading States**: Skeleton loaders, error alerts with retry, empty state CTAs

## 6. Context Browser
- **Document Tree Navigation**: Browse bookshop-product-context directory structure
- **Document Viewer**: Read .md, .yaml, .json files in-app
- **Full-Text Search**: Search across all documentation files
- **API**: `/api/v1/context/tree`, `/api/v1/context/read`, `/api/v1/context/search`

## 7. Frontend UI/UX
- **Responsive Sidebar Navigation**: Dashboard, Books, Customers, Categories, Orders
- **13 Reusable Components**: Button, Input, Select, Table, Modal, ConfirmDialog, Card, StatusBadge, SearchInput, IconButton, Spinner, EmptyState, Alert
- **Form Validation**: React Hook Form + Zod with inline error messages
- **Toast Notifications**: Auto-dismiss, stackable, color-coded (success/error/info)
- **Debounced Search**: 300ms debounce for search inputs
- **WCAG 2.1 AA**: Focus rings, ARIA labels, keyboard navigation, contrast compliance

## 8. REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books` | Create book |
| GET | `/api/v1/books` | List books |
| GET | `/api/v1/books/search?q=` | Search books |
| GET | `/api/v1/books/:id` | Get book by ID |
| PUT | `/api/v1/books/:id` | Update book |
| DELETE | `/api/v1/books/:id` | Delete book |
| POST | `/api/v1/categories` | Create category |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/:id` | Get category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| POST | `/api/v1/customers` | Create customer |
| GET | `/api/v1/customers` | List customers |
| GET | `/api/v1/customers/search?q=` | Search customers |
| GET | `/api/v1/customers/:id` | Get customer |
| PUT | `/api/v1/customers/:id` | Update customer |
| DELETE | `/api/v1/customers/:id` | Delete customer |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders` | List orders |
| GET | `/api/v1/orders/:id` | Get order |
| PUT | `/api/v1/orders/:id/status` | Update order status |
| GET | `/api/v1/context/tree` | Context tree |
| GET | `/api/v1/context/read?path=` | Read context doc |
| GET | `/api/v1/context/search?q=` | Search context |
| GET | `/health` | Health check |

## 9. Event Contracts
- **BookCreated**: bookId, title, author, price, stock, createdAt
- **BookUpdated**: bookId, changes, previousValues, updatedAt
- **BookDeleted**: bookId, deletedBy, deletedAt
- **StockUpdated**: bookId, oldStock, newStock, reason (enum), orderId
- **LowStockAlert**: (future) threshold breach notification

## 10. Database & Persistence
- **Dual Implementation**: InMemoryDatabase (reference) + PostgreSQL (active)
- **4 Tables**: categories, books, customers, orders
- **Constraints**: CHECK (price ≥0, stock ≥0, quantity ≥1), UNIQUE (name, email), FK referential integrity
- **Indexes**: On search/filter columns (title, author, name, email, status, createdAt)
- **UUID PKs**: Via pgcrypto extension
- **Auto-update trigger**: updated_at on all tables
- **Seed Data**: 5 categories, 10 books, 4 customers
- **DB Selection**: Via `USE_IN_MEMORY` environment variable

## 11. Architecture
- **Backend**: Layered (Route → Service → Repository → DB), Zod validation, custom error classes, CORS, request logging, health endpoint
- **Frontend**: Component hierarchy, custom hooks for data fetching, ToastContext for global state, lazy-loaded routes, memoization
- **Security**: Zod input validation, parameterized queries, CORS, path traversal protection
- **Performance**: DB indexes, debounced search, memoized values, code splitting, result limiting

## 12. User Roles (Documented)
- **Bookshop Owner**: Full access, configuration
- **Store Manager**: Inventory, orders, customers
- **Cashier/Sales Staff**: Order creation, status updates, search
- **Inventory Staff**: Book records, stock adjustments

## 13. Pagination
- Offset-based pagination on all list endpoints (`?page=1&limit=20`)
- Response includes metadata: `{ data, pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`
- Default limit: 20, max limit: 100
- Search endpoints (`/books/search`, `/customers/search`) also paginated
- Frontend Pagination component with page buttons, prev/next, page size selector

## 14. Stock Movement Log
- Every stock change recorded with timestamp, old/new values, delta, and reason
- **Reasons**: `order_deduction`, `manual_restock`, `manual_adjustment`, `correction`
- View endpoint: `GET /api/v1/books/:id/stock-movements` (paginated)
- Manual adjustment: `POST /api/v1/books/:id/stock-adjust`
- Integrated into order creation — auto-records deduction
- Dashboard shows recent stock activity across all books

## 15. Audit Log
- Every create/update/delete on books, customers, orders is logged immutably
- Captures: entity type, entity ID, action, previous state (JSONB), new state (JSONB), performer, timestamp
- View endpoint: `GET /api/v1/audit-log` with filters (entityType, entityId, action, date range, pagination)
- Wired into existing services — no manual effort per operation
- Dedicated frontend page with filter bar and paginated table

## 16. Export CSV
- `GET /api/v1/export/:entity` for `books`, `customers`, `orders`
- Returns `Content-Type: text/csv` with BOM for Excel compatibility
- Respects current list filters (e.g., export only pending orders)
- Filename includes date: `books-2026-06-10.csv`
- Frontend "Export CSV" button on each list page, triggers browser download

---

## 17. Monthly Sales Analytics Panel
- **Summary Bar**: This month's revenue with trend arrow vs last month, plus YTD total revenue
- **Monthly Table**: Columns — Month, Total Orders, Books Sold, Revenue, Avg Order Value, Top-Selling Book
- **Trend Badges**: Revenue change vs previous month displayed as ↑ (up) / ↓ (down) / — (flat)
- **Month Drill-Down**: Clicking a month row navigates to `/orders?month=YYYY-MM` with filtered order list
- **Backend**: `GET /api/v1/analytics/sales-by-month` — pure aggregation queries on existing `orders` table, no new tables
- **Data**: month, totalOrders, totalBooksSold, totalRevenue, averageOrderValue, topBook, trendArrow, trendPercentage

---

## 18. Planned Features
- JWT authentication & RBAC
- Swagger UI docs
- ISBN, publisher, book covers, multiple authors
- Soft delete
- Book reviews, ratings, recommendations
- Bulk import/export
- Customer tiers, credit limits, blacklist
- Stock restoration on cancellation, partial fulfillment
- Payment gateway, shipping, supplier integration
- E-commerce integration, mobile apps
- Multi-store management
