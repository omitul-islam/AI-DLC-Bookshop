# Database Design

## Purpose
Data models, relationships, constraints, and persistence strategy for the Bookshop Management System.

---

## Database Philosophy

The project went through two database phases:

### Phase 1: In-Memory (Prototyping — Retained for Reference)
- `Map<string, T>` collections for each entity in `InMemoryDatabase` class
- No external dependencies required
- Data resets on server restart
- Ideal for rapid prototyping without infrastructure
- **Status**: Available as reference / development fallback. Set `USE_IN_MEMORY=true` to use.

### Phase 2: PostgreSQL (Production — Active)
- Relational database with ACID compliance via `pg` Pool
- UUID primary keys for distributed compatibility
- Parameterized queries to prevent SQL injection
- Connection pooling (max 10 connections, 30s idle timeout)
- Real transactions with `BEGIN` / `COMMIT` / `ROLLBACK` via dedicated `PoolClient`
- Schema auto-initialized via `schema.sql`
- **Status**: ✅ Active and used by default

---

## Data Models

### Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│    Customer      │         │     Order        │         │      Book        │         │   Category   │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤         ├──────────────┤
│ id (PK)          │1       M│ customerId (FK)  │         │ id (PK)          │         │ id (PK)      │
│ name             │─────────│ bookId (FK)      │─────────│ title            │         │ name         │
│ email            │         │ quantity         │ M      1│ author           │         │ description? │
│ phone            │         │ totalPrice       │         │ price            │M       1│ createdAt    │
│ address?         │         │ status           │         │ stock            │─────────│ updatedAt    │
│ createdAt        │         │ createdAt        │         │ categoryId (FK)  │         └──────────────┘
│ updatedAt        │         │ updatedAt        │         │ createdAt        │
└──────────────────┘         └──────────────────┘         │ updatedAt        │
                                                           └───────┬──────────┘
                                                                   │1
                                                                   │
                                                           ┌───────┴──────────┐
                                                           │ StockMovement    │
                                                           ├──────────────────┤
                                                           │ id (PK)          │
                                                           │ bookId (FK)      │
                                                           │ oldStock         │
                                                           │ newStock         │
                                                           │ quantity         │
                                                           │ reason           │
                                                           │ referenceId?     │
                                                           │ createdAt        │
                                                           └──────────────────┘

┌──────────────────────────────────────────────────────┐
│                    AuditEntry                         │
├──────────────────────────────────────────────────────┤
│ id (PK)                                              │
│ entityType (book / customer / order)                  │
│ entityId (UUID of affected record)                    │
│ action (created / updated / deleted)                  │
│ previousState (JSONB)                                 │
│ newState (JSONB)                                      │
│ performedBy                                           │
│ createdAt                                             │
└──────────────────────────────────────────────────────┘
```

### Category

**TypeScript (camelCase) — shared across both implementations:**
```typescript
interface Category {
  id: string;           // UUID v4
  name: string;         // unique, max 100 chars
  description: string;  // max 500 chars
  createdAt: Date;
  updatedAt: Date;
}
```

**PostgreSQL (snake_case):**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default `gen_random_uuid()` |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | VARCHAR(500) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, default NOW() |

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| name | non-empty, unique, max 100 | BR-CATEGORY-001, BR-CATEGORY-002 |
| description | max 500 | BR-CATEGORY-003 |

### Book

**TypeScript (camelCase) — shared across both implementations:**
```typescript
interface Book {
  id: string;           // UUID v4
  title: string;        // max 255 chars
  author: string;       // max 255 chars
  price: number;        // DECIMAL(10,2), >= 0
  stock: number;        // INTEGER, >= 0
  categoryId: string;   // FK → Category.id, required
  coverUrl?: string;    // VARCHAR(500), Supabase S3 public URL
  createdAt: Date;
  updatedAt: Date;
}
```

**PostgreSQL (snake_case):**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default `gen_random_uuid()` |
| title | VARCHAR(255) | NOT NULL |
| author | VARCHAR(255) | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL, CHECK (>= 0) |
| stock | INTEGER | NOT NULL, CHECK (>= 0) |
| category_id | UUID | NOT NULL, FK → categories(id) |
| cover_url | VARCHAR(500) | — |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, default NOW() |

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| title | non-empty, max 255 | BR-BOOK-001 |
| author | non-empty, max 255 | BR-BOOK-001 |
| price | >= 0, decimal | BR-BOOK-002 |
| stock | >= 0, integer | BR-BOOK-003 |
| category_id | must reference existing category | BR-CATEGORY-005 |

### Customer

```typescript
interface Customer {
  id: string;           // UUID v4
  name: string;         // max 100 chars
  email: string;        // valid email format, unique
  phone: string;        // regex: /^\+?[\d\s\-\(\)]+$/, min 10
  address?: string;     // max 500 chars, optional
  createdAt: Date;
  updatedAt: Date;
}
```

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| name | non-empty, max 100 | BR-CUSTOMER-005 |
| email | valid email format, unique | BR-CUSTOMER-002, BR-CUSTOMER-003 |
| phone | valid format, min 10 | BR-CUSTOMER-004 |
| address | max 500 (optional) | BR-CUSTOMER-006 |

### Order

```typescript
interface Order {
  id: string;                    // UUID v4
  customerId: string;            // FK → Customer.id
  bookId: string;                // FK → Book.id
  quantity: number;              // INTEGER, >= 1
  totalPrice: number;            // DECIMAL(10,2), book.price × quantity
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}
```

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| customerId | must reference existing customer | BR-ORDER-010 |
| bookId | must reference existing book | BR-ORDER-001 |
| quantity | >= 1, integer | BR-ORDER-007 |
| totalPrice | computed: book.price × quantity | BR-ORDER-001 |
| status | valid enum, follows workflow | BR-ORDER-004, BR-ORDER-005 |

**Status workflow:**
```
pending → shipped → delivered
```

---

## Current Implementation

The project has **two** database implementations in `bookshop-backend/src/db/database.ts`:

| Class | Location | Persistence | Active By Default |
|-------|----------|-------------|-------------------|
| `InMemoryDatabase` | `database.ts` (lines 45–215) | ❌ RAM only, resets on restart | ❌ (opt-in via `USE_IN_MEMORY=true`) |
| `PostgresDatabase` | `database.ts` (lines 220–420) | ✅ PostgreSQL, persistent | ✅ (default) |

### Database Selector

```typescript
const useInMemory = process.env.USE_IN_MEMORY === 'true';
let db: PostgresDatabase | InMemoryDatabase;

if (useInMemory) {
  db = new InMemoryDatabase();
} else {
  db = new PostgresDatabase();
}
```

Controlled by the `USE_IN_MEMORY` environment variable (defined in `.env`):
- `USE_IN_MEMORY=true` → InMemoryDatabase (no infrastructure needed, data resets)
- `USE_IN_MEMORY=false` (or unset) → PostgreSQL (persistent, requires running PG instance)

### InMemoryDatabase (Reference)

The `InMemoryDatabase` class uses `Map<string, T>` collections:

```typescript
class InMemoryDatabase {
  private books: Map<string, Book> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private categories: Map<string, Category> = new Map();
  private stockMovements: Map<string, StockMovement> = new Map();
  private auditLogs: Map<string, AuditEntry> = new Map();
}
```

**Characteristics:**
- Write operations: direct Map.set/delete
- Read operations: Array.from().filter() / .find() over all values
- Sorting: in-memory sort on `createdAt` descending
- Transactions: pass-through (no rollback — executes callback directly)

### PostgresDatabase (Active)

The `PostgresDatabase` class uses `pg.Pool` for connection pooling:

```typescript
class PostgresDatabase {
  private pool: Pool;
  private txClient: PoolClient | null = null;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'bookshop',
      user: process.env.DB_USER || 'bookshop',
      password: process.env.DB_PASSWORD || 'bookshop',
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
}
```

**Characteristics:**
- All queries use **parameterized statements** (`$1`, `$2`, ...) — no SQL injection
- **snake_case** column names mapped to **camelCase** TypeScript via `toCamelCase()` helper
- Connection pool with configurable max connections and idle timeout
- Transaction-aware queries: uses a dedicated `PoolClient` inside transactions

#### Transaction Pattern

```typescript
async transaction<T>(callback: (db: PostgresDatabase) => Promise<T>): Promise<T> {
  const client = await this.pool.connect();
  this.txClient = client;       // All subsequent db.query() calls use this client
  try {
    await client.query('BEGIN');
    const result = await callback(this);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    this.txClient = null;       // Reset to pool-level queries
  }
}
```

The private `query()` method checks `this.txClient` — if set (inside a transaction), it routes queries through the dedicated client; otherwise it uses the pool:

```typescript
private async query(text: string, params?: any[]): Promise<QueryResult> {
  if (this.txClient) {
    return this.txClient.query(text, params);
  }
  return this.pool.query(text, params);
}
```

This ensures all operations inside `transaction()` run on the same database connection.

### CRUD Operations (Both Implementations)

Both classes implement the same interface with identical method signatures:

| Entity | Create | Read (single) | Read (all) | Update | Delete |
|--------|--------|---------------|------------|--------|--------|
| Category | `createCategory` | `findCategoryById` | `findAllCategories` | `updateCategory` | `deleteCategory` |
| Book | `createBook` | `findBookById` | `findAllBooks` | `updateBook` | `deleteBook` |
| Customer | `createCustomer` | `findCustomerById` | `findAllCustomers` | `updateCustomer` | `deleteCustomer` |
| Order | `createOrder` | `findOrderById` | `findAllOrders` | `updateOrder` | — |
| StockMovement | `recordStockMovement` | — | `getStockMovements` | — | — |
| AuditEntry | `createAuditLog` | — | `getAuditLog` | — | — |

### Query Operations

| Query | Method | Filter (PostgreSQL) |
|-------|--------|---------------------|
| Find category by name | `findCategoryByName(name)` | `WHERE LOWER(name) = LOWER($1)` |
| Search books by title/author | `searchBooks(query, page, limit)` | `WHERE LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1)` + OFFSET/LIMIT |
| Find books by category | `findBooksByCategory(categoryId)` | `WHERE category_id = $1` |
| Find customer by email | `findCustomerByEmail(email)` | `WHERE LOWER(email) = LOWER($1)` |
| Search customers by name/email/phone | `searchCustomers(query, page, limit)` | `WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) OR phone LIKE $1` + OFFSET/LIMIT |
| Find orders by customer | `findOrdersByCustomerId(customerId, page, limit)` | `WHERE customer_id = $1` + OFFSET/LIMIT |
| Find orders by status | `findOrdersByStatus(status, page, limit)` | `WHERE status = $1` + OFFSET/LIMIT |
| Get stock movements by book | `getStockMovements(bookId, page, limit)` | `WHERE book_id = $1 ORDER BY created_at DESC` + OFFSET/LIMIT |
| Get audit log (filtered) | `getAuditLog(filters)` | Filterable by entity_type, entity_id, action, date range + OFFSET/LIMIT |

### Sort Order (PostgreSQL)
- All list queries use `ORDER BY created_at DESC` (newest first)

### Schema Initialization

The schema is defined in `src/db/schema.sql` — an idempotent script with `IF NOT EXISTS` guards:

**Tables created:**
| Table | Key Columns | Constraints |
|-------|-------------|-------------|
| `categories` | `id`, `name`, `description` | `UNIQUE(name)` |
| `books` | `id`, `title`, `author`, `price`, `stock`, `category_id` | `CHECK(price >= 0)`, `CHECK(stock >= 0)`, `FK → categories(id)` |
| `customers` | `id`, `name`, `email`, `phone`, `address` | `UNIQUE(email)` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `total_price`, `status` | `CHECK(quantity >= 1)`, `CHECK(total_price >= 0)`, `CHECK(status IN (...))` |
| `stock_movements` | `id`, `book_id`, `old_stock`, `new_stock`, `quantity`, `reason` | `CHECK(reason IN (...))`, `FK → books(id)` |
| `audit_log` | `id`, `entity_type`, `entity_id`, `action`, `previous_state`, `new_state` | `CHECK(action IN (...))` |

**Indexes:** All tables indexed on `created_at DESC`; key search/filter columns indexed.
**Triggers:** Auto-update `updated_at` on every row update (via `update_updated_at_column()` function).
**Extension:** `pgcrypto` for `gen_random_uuid()`.

Run once before first startup:
```bash
docker exec -i bookshop-pg psql -U bookshop -d bookshop < src/db/schema.sql
```

Or via the app startup (future: auto-migrate on boot).

### Seed Data

The `src/db/seed.ts` script populates the database with sample data:

```bash
npm run seed
```

**Dummy data included:**
| Entity | Count | Details |
|--------|-------|---------|
| Categories | 5 | Fiction, Non-Fiction, Science, History, Fantasy |
| Books | 10 | Gatsby, Mockingbird, 1984, Sapiens, Hobbit, Dune, Cosmos, etc. |
| Customers | 4 | Alice, Bob, Carol, David |

The script clears existing data before seeding (safe for development).

---

## Business Rules → Database Constraints

| Business Rule | Database Enforcement |
|---------------|---------------------|
| Category name unique | `UNIQUE (name)` |
| BR-BOOK-002: price >= 0 | `CHECK (price >= 0)` |
| BR-BOOK-003: stock >= 0 | `CHECK (stock >= 0)` |
| BR-ORDER-001: stock >= quantity | Application-layer (service) |
| BR-ORDER-002: auto stock deduction | Transaction (order + stock_movement) |
| BR-ORDER-003: prevent negative stock | `CHECK (stock >= 0)` + app validation |
| BR-ORDER-007: quantity >= 1 | `CHECK (quantity >= 1)` |
| BR-CUSTOMER-003: unique email | `UNIQUE (email)` |
| Stock movement reason valid | `CHECK (reason IN ('order_deduction', 'manual_restock', 'manual_adjustment', 'correction'))` |
| Audit action valid | `CHECK (action IN ('created', 'updated', 'deleted'))` |

---

## PostgreSQL Schema (Migration Target)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_created_at ON categories(created_at DESC);

-- Books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id),
  cover_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  book_id UUID NOT NULL REFERENCES books(id),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_book_id ON orders(book_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Stock Movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id),
  old_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('order_deduction', 'manual_restock', 'manual_adjustment', 'correction')),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_book_id ON stock_movements(book_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  previous_state JSONB,
  new_state JSONB,
  performed_by VARCHAR(100) NOT NULL DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Environment Configuration

The `.env` file at `bookshop-backend/.env` controls database behavior:

```ini
# Database Selector
USE_IN_MEMORY=false          # true = in-memory, false = PostgreSQL

# PostgreSQL Connection
DB_HOST=localhost             # Docker host
DB_PORT=5432                  # Default PostgreSQL port
DB_NAME=bookshop              # Database name
DB_USER=bookshop              # Role/user
DB_PASSWORD=bookshop          # Password
```

### Switching Between Implementations

To use the in-memory database (no PostgreSQL needed):
```bash
USE_IN_MEMORY=true npx tsx src/index.ts
```

To start with PostgreSQL (default):
```bash
npx tsx src/index.ts
```

---

## Key Design Decisions

### UUID Primary Keys
- Chosen over auto-increment integers for distributed compatibility
- Generated client-side (`uuid` package) or server-side (`gen_random_uuid()`)
- Exposed in API responses (no sequential ID leak)

### totalPrice Denormalization
- `totalPrice` is stored on the order rather than computed from `book.price × quantity` at query time
- Rationale:
  - Preserves historical price (book price may change later)
  - Avoids JOIN for every order read
  - Simplifies reporting queries

### Status as Enum/String
- Stored as `VARCHAR` with `CHECK` constraint rather than PostgreSQL `ENUM`
- Easier to add new statuses in future (e.g., `cancelled`, `returned`)
- Application-layer (TypeScript `OrderStatus` type) enforces valid values

### No Cascade Delete
- Orders reference both `customer_id` and `book_id` via foreign keys
- Deleting a customer or book with existing orders will fail (referential integrity)
- Category deletion is blocked at the application layer if books are assigned
- Future: soft-delete or archive before removal (BR-BOOK-009)

---

## Query Patterns

### Books by Category
```sql
SELECT * FROM books
WHERE category_id = $1
ORDER BY created_at DESC;
```

### Book Search (with category filter)
```sql
SELECT * FROM books
WHERE (LOWER(title) LIKE '%' || LOWER($1) || '%'
   OR LOWER(author) LIKE '%' || LOWER($1) || '%')
  AND ($2::UUID IS NULL OR category_id = $2)
ORDER BY created_at DESC;
```

### Category with Book Count
```sql
SELECT c.id, c.name, COUNT(b.id) AS book_count
FROM categories c
LEFT JOIN books b ON b.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Order Creation (Transaction)
```sql
BEGIN;
  INSERT INTO orders (id, customer_id, book_id, quantity, total_price, status)
  VALUES ($1, $2, $3, $4, $5, 'pending');

  UPDATE books SET stock = stock - $4
  WHERE id = $3 AND stock >= $4;

  -- Check row count to verify stock was sufficient
COMMIT;
```

### Dashboard: Total Inventory Value
```sql
SELECT SUM(price * stock) AS total_value FROM books;
```

### Paginated List (all entities)
```sql
SELECT * FROM books
ORDER BY created_at DESC
OFFSET $1 LIMIT $2;

-- Parallel count for pagination metadata
SELECT COUNT(*) as count FROM books;
```

Applied to: books, customers, orders, stock_movements, audit_log.

### Dashboard: Low Stock Books
```sql
SELECT * FROM books WHERE stock < 5 ORDER BY stock ASC;
```

---

## Migration Path

| Phase | Status | Description |
|-------|--------|-------------|
| v1.0  | ✅ Done | In-memory Map-based storage |
| v1.1  | ✅ Done | PostgreSQL with `pg` Pool |
| v2.0  | 📅 Future | Prisma ORM, connection pooling |

### Migration Completed (In-Memory → PostgreSQL)

The following steps were executed to migrate from Phase 1 to Phase 2:

| # | Step | Details |
|---|------|---------|
| 1 | Install `pg` package | `npm install pg @types/pg` |
| 2 | Design schema | Created `schema.sql` with 4 tables, FK constraints, indexes, triggers |
| 3 | Implement `PostgresDatabase` | Full class with same interface as `InMemoryDatabase` |
| 4 | Add `toCamelCase()` mapper | Converts `snake_case` DB rows to `camelCase` TypeScript objects |
| 5 | Implement transaction support | `BEGIN`/`COMMIT`/`ROLLBACK` with dedicated `PoolClient` |
| 6 | Add database selector | Environment variable `USE_IN_MEMORY` to switch between implementations |
| 7 | Update `.env` | Added PostgreSQL connection config (host, port, db, user, password) |
| 8 | Create seed script | `seed.ts` with sample categories, books, customers |
| 9 | Update services | Transaction callback adapted for both implementations |
| 10 | Update context docs | This file, execution plan, audit trail, README |

### Future: Phase v2.0 — Prisma ORM

Potential improvements for a future ORM migration:
- Declarative schema via Prisma schema file
- Type-safe queries with auto-generated types
- Built-in migrations with `prisma migrate`
- Connection pooling with Prisma Accelerate

---

## Stock Movement Log

**TypeScript (camelCase):**
```typescript
interface StockMovement {
  id: string;           // UUID v4
  bookId: string;       // FK → Book.id
  oldStock: number;     // Previous stock level
  newStock: number;     // New stock level
  quantity: number;     // Delta (negative for deduction, positive for restock)
  reason: 'order_deduction' | 'manual_restock' | 'manual_adjustment' | 'correction';
  referenceId?: string; // Order ID if reason is order_deduction
  createdAt: Date;
}
```

**PostgreSQL (snake_case):**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default `gen_random_uuid()` |
| book_id | UUID | NOT NULL, FK → books(id) |
| old_stock | INTEGER | NOT NULL |
| new_stock | INTEGER | NOT NULL |
| quantity | INTEGER | NOT NULL |
| reason | VARCHAR(50) | NOT NULL, CHECK IN ('order_deduction', 'manual_restock', 'manual_adjustment', 'correction') |
| reference_id | UUID | NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| reason | must be one of the 4 valid reasons | Stock movement business rule |
| book_id | must reference existing book | FK constraint |

## Audit Log

**TypeScript (camelCase):**
```typescript
interface AuditEntry {
  id: string;           // UUID v4
  entityType: string;   // 'book' | 'customer' | 'order'
  entityId: string;     // UUID of the affected entity
  action: 'created' | 'updated' | 'deleted';
  previousState?: any;  // JSON snapshot before change
  newState?: any;       // JSON snapshot after change
  performedBy: string;  // User identifier (default: 'system')
  createdAt: Date;
}
```

**PostgreSQL (snake_case):**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default `gen_random_uuid()` |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | NOT NULL |
| action | VARCHAR(20) | NOT NULL, CHECK IN ('created', 'updated', 'deleted') |
| previous_state | JSONB | NULL |
| new_state | JSONB | NULL |
| performed_by | VARCHAR(100) | NOT NULL, DEFAULT 'system' |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |

**Constraints:**
| Field | Rule | Source |
|-------|------|--------|
| action | must be one of the 3 valid actions | Audit log business rule |
| entity_type + entity_id | indexed for filtered queries | Performance |

---

## Future Considerations

### Soft Deletes
- Add `deleted_at TIMESTAMP` to books and customers
- Filter `WHERE deleted_at IS NULL` in queries
- Allows recovery and audit trail

### Caching
- Redis for frequently accessed book data
- Cache invalidation on stock updates
- Session store for authenticated users

### Full-Text Search
- PostgreSQL `tsvector`/`tsquery` for book search
- Better than `LIKE '%term%'` for performance and relevance ranking

---

## Related Documents

- [Backend Architecture](../01-system-design/backend-architecture.md)
- [Book Business Rules](../../02-domain/03-business-rules/book-rules.md)
- [Category Business Rules](../../02-domain/03-business-rules/category-rules.md)
- [Order Business Rules](../../02-domain/03-business-rules/order-rules.md)
- [Customer Business Rules](../../02-domain/03-business-rules/customer-rules.md)
- [Books API Contract](../../06-contracts/01-apis/rest/books.yaml)
- [Categories API Contract](../../06-contracts/01-apis/rest/categories.yaml)
- [Orders API Contract](../../06-contracts/01-apis/rest/orders.yaml)
- [Schema SQL](../../../bookshop-backend/src/db/schema.sql) — Table definitions
- [Seed Script](../../../bookshop-backend/src/db/seed.ts) — Sample data

---

**Last Updated**: June 2026  
**Active Database**: PostgreSQL 16 (Docker)  
**Fallback**: InMemoryDatabase (via `USE_IN_MEMORY=true`)  
**Naming Convention**: snake_case for DB columns, camelCase for TypeScript  
**Tables**: 6 (categories, books, customers, orders, stock_movements, audit_log)
