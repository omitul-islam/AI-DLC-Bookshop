# 🚀 Implementation Guide

## Ready to Start Building!

Your AI-DLC product context is complete. Here's how to use it to build your bookshop system.

---

## 📋 What You Have

### Complete Documentation
- ✅ **9 User Stories** with acceptance criteria
- ✅ **10 API Contracts** (Books, Categories, Customers, Orders, Cart, Export, Stock, Audit, Analytics) in OpenAPI 3.0
- ✅ **Business Rules** for validation logic
- ✅ **Module Specifications** with data models
- ✅ **Event Contracts** for async communication

---

## 🎯 Implementation Order

### Phase 1: Setup (Day 1)
1. Create backend repo (e.g., `bookshop-backend`)
2. Add this repo as submodule:
   ```bash
   git submodule add ./bookshop-product-context context
   ```
3. Setup framework (Express/NestJS for Node, FastAPI/Django for Python)
4. Configure database (PostgreSQL recommended)

### Phase 2: Book Management (Days 2-3)
Implement in this order:

1. **US-001: Add Book** (3 points)
   - Business Rules: `context/02-domain/03-business-rules/book-rules.md`
   - API Contract: `context/06-contracts/01-apis/rest/books.yaml`
   - Module Spec: `context/05-modules/02-book-management/book-management.md`

2. **US-002: View All Books** (2 points)
   - Quick win - simple GET endpoint

3. **US-005: Search Books** (3 points)
   - Add search functionality
   - Database indexing required

4. **US-003: Update Book** (2 points)
   - Partial update support

5. **US-004: Delete Book** (1 point)
   - Simple deletion

### Phase 3: Customer Management (Days 4-5)

6. **US-006: Add Customer** (2 points)
   - Email uniqueness validation
   - Phone format validation

7. **US-007: View Customers** (3 points)
   - List with search

### Phase 3.5: Category Management (Days 5-6)

8. **US-010: Add Category** (3 points)
   - Name uniqueness validation
   - Description validation

9. **US-011: View Categories** (2 points)
   - List with search

10. **US-012: Update Category** (2 points)
    - Name uniqueness validation on rename
    - Description validation

11. **US-013: Delete Category** (1 point)
    - Only if no books assigned (404 error otherwise)

### Phase 4: Order Management (Days 6-8)

8. **US-008: Create Order** (5 points) ⭐ **Most Complex**
   - Stock validation (BR-ORDER-001)
   - Automatic stock deduction (BR-ORDER-002)
   - Transaction safety (atomic operation)
   - This is the critical feature!

9. **US-009: Update Order Status** (3 points)
   - Status workflow validation
   - Prevent invalid transitions

---

## 💻 Implementation Template

### For Each User Story:

#### 1. Read the Context
```bash
# Check business rules
cat context/02-domain/03-business-rules/book-rules.md

# Review API contract
cat context/06-contracts/01-apis/rest/books.yaml
```

#### 2. Generate Types from OpenAPI
```bash
# Using openapi-typescript (Node.js)
npx openapi-typescript context/06-contracts/01-apis/rest/books.yaml -o src/types/books.ts

# Or use swagger-codegen, openapi-generator, etc.
```

#### 3. Implement Service Layer
```typescript
// src/services/book.service.ts
import { CreateBookRequest, BookResponse } from '../types/books';
import { BookValidator } from '../validators/book.validator';
import { BookRepository } from '../repositories/book.repository';

export class BookService {
  async addBook(request: CreateBookRequest): Promise<BookResponse> {
    // Step 1: Validate (from BR-BOOK-001, BR-BOOK-002, BR-BOOK-003)
    BookValidator.validateCreateRequest(request);
    
    // Step 2: Create book
    const book = await this.bookRepository.create(request);
    
    // Step 3: Return response (matches OpenAPI schema)
    return book;
  }
}
```

#### 4. Implement Validation (from Business Rules)
```typescript
// src/validators/book.validator.ts
export class BookValidator {
  static validateCreateRequest(req: CreateBookRequest) {
    // BR-BOOK-001: Required fields
    if (!req.title || !req.author || req.price === undefined || req.stock === undefined) {
      throw new ValidationError('Missing required fields');
    }
    
    // BR-BOOK-002: Price >= 0
    if (req.price < 0) {
      throw new ValidationError('Price must be zero or greater');
    }
    
    // BR-BOOK-003: Stock >= 0 and integer
    if (req.stock < 0 || !Number.isInteger(req.stock)) {
      throw new ValidationError('Stock must be non-negative integer');
    }
  }
}
```

#### 5. Implement API Endpoint
```typescript
// src/routes/books.ts
router.post('/books', async (req, res) => {
  try {
    const book = await bookService.addBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

#### 6. Write Tests (from Acceptance Criteria)
```typescript
// src/services/book.service.test.ts
describe('BookService.addBook', () => {
  // AC1: Required Fields
  it('should create book with valid data', async () => {
    const request = {
      title: 'Test Book',
      author: 'Test Author',
      price: 10.99,
      stock: 5
    };
    
    const result = await bookService.addBook(request);
    
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Book');
  });
  
  // AC2: Price Validation
  it('should reject negative price', async () => {
    const request = { title: 'Test', author: 'Test', price: -5, stock: 5 };
    
    await expect(bookService.addBook(request))
      .rejects.toThrow('Price must be zero or greater');
  });
  
  // AC3: Stock Validation
  it('should reject negative stock', async () => {
    const request = { title: 'Test', author: 'Test', price: 10, stock: -1 };
    
    await expect(bookService.addBook(request))
      .rejects.toThrow('Stock must be non-negative integer');
  });
});
```

---

## 🗄️ Database Schema

Use the schemas from module specs:

```sql
-- From context/05-modules/02-book-management/book-management.md
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);

-- Similar for customers and orders tables
-- See module specs for complete schemas
```

---

## ⚠️ Critical Implementation Notes

### Order Creation (US-008) - Most Important!

This requires **transaction safety**:

```typescript
async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  // Start transaction
  return await db.transaction(async (trx) => {
    // 1. Validate customer exists (BR-ORDER-010)
    const customer = await trx.customers.findById(request.customerId);
    if (!customer) throw new NotFoundError('Customer not found');
    
    // 2. Validate book exists
    const book = await trx.books.findById(request.bookId);
    if (!book) throw new NotFoundError('Book not found');
    
    // 3. Check stock availability (BR-ORDER-001)
    if (book.stock < request.quantity) {
      throw new ValidationError('Insufficient stock', {
        requested: request.quantity,
        available: book.stock
      });
    }
    
    // 4. Create order
    const order = await trx.orders.create({
      customerId: request.customerId,
      bookId: request.bookId,
      quantity: request.quantity,
      totalPrice: book.price * request.quantity,
      status: 'pending'
    });
    
    // 5. Reduce stock (BR-ORDER-002)
    await trx.books.update(request.bookId, {
      stock: book.stock - request.quantity
    });
    
    // 6. Return order (transaction commits)
    return order;
  });
}
```

If ANY step fails, entire transaction rolls back!

---

## 🧪 Testing Checklist

For each user story, test:

### Happy Path
- ✅ Valid input → Success response
- ✅ Data persisted correctly
- ✅ Response matches API contract

### Validation Cases
- ✅ Missing required fields → 400 error
- ✅ Invalid data format → 400 error
- ✅ Business rule violations → 400 error

### Error Cases
- ✅ Resource not found → 404 error
- ✅ Duplicate data → 400 error (if applicable)

### Edge Cases
- ✅ Boundary values (0, empty, max)
- ✅ Concurrent requests (especially for orders!)

---

## 📦 Recommended Tech Stack

### Backend (Choose One)

**Node.js/TypeScript**
- Framework: Express or NestJS
- ORM: Prisma or TypeORM
- Validation: Joi or Zod
- Testing: Jest

**Python**
- Framework: FastAPI or Django REST
- ORM: SQLAlchemy or Django ORM
- Validation: Pydantic
- Testing: Pytest

### Database
- PostgreSQL (production) — Docker: `postgres:16-alpine`
- In-memory (development) — `USE_IN_MEMORY=true`

### API Documentation
- Swagger UI (from OpenAPI specs)
- Redoc (alternative)

---

## 🎯 Definition of Done

Before marking a story as complete:

- [ ] Feature implemented according to acceptance criteria
- [ ] All business rules enforced
- [ ] API matches OpenAPI contract
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] Error handling implemented
- [ ] Database migrations created
- [ ] API documented (auto-generated from OpenAPI)
- [ ] Code reviewed
- [ ] Manually tested

----------------------------------

## 🏷️ Phase 5: Category Management

### Step 1: Category Data Model
```typescript
// bookshop-backend/src/db/database.ts
interface Category {
  id: string;
  name: string;        // unique, max 100 chars
  description?: string; // max 500 chars, optional
  createdAt: Date;
  updatedAt: Date;
}
```

Add storage to `InMemoryDatabase`:
```typescript
private categories: Map<string, Category> = new Map();
```

### Step 2: Category Validator
```typescript
// bookshop-backend/src/validators/category.validator.ts
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;
```

### Step 3: Category Service
```typescript
// bookshop-backend/src/services/category.service.ts
import { v4 as uuidv4 } from 'uuid';
import { db, Category } from '../db/database';

export class CategoryService {
  async addCategory(request: CreateCategoryRequest): Promise<Category> {
    // Check name uniqueness
    const existing = await db.findCategoryByName(request.name);
    if (existing) throw new Error('Category name already exists');

    const category: Category = {
      id: uuidv4(),
      name: request.name,
      description: request.description || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await db.createCategory(category);
  }

  async listCategories(): Promise<Category[]> {
    return await db.findAllCategories();
  }

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    const existing = await db.findCategoryById(id);
    if (!existing) throw new Error('Category not found');

    // If renaming, check uniqueness
    if (request.name && request.name !== existing.name) {
      const duplicate = await db.findCategoryByName(request.name);
      if (duplicate) throw new Error('Category name already exists');
    }

    const updated = await db.updateCategory(id, request);
    if (!updated) throw new Error('Failed to update category');
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await db.findCategoryById(id);
    if (!category) throw new Error('Category not found');

    // BR: Prevent deletion if books are assigned
    const booksInCategory = await db.findBooksByCategory(id);
    if (booksInCategory.length > 0) {
      throw new Error('Cannot delete category with assigned books');
    }

    await db.deleteCategory(id);
  }
}
```

### Step 4: Category Routes
```typescript
// bookshop-backend/src/routes/categories.ts
import { Router } from 'express';
import { categoryService } from '../services/category.service';
import { CreateCategorySchema, UpdateCategorySchema } from '../validators/category.validator';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const validated = CreateCategorySchema.parse(req.body);
    const category = await categoryService.addCategory(validated);
    res.status(201).json(category);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const categories = await categoryService.listCategories();
  res.json(categories);
});

router.put('/:id', async (req, res) => {
  try {
    const validated = UpdateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, validated);
    res.json(category);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.message === 'Category not found') return res.status(404).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Category not found') return res.status(404).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

### Step 5: Update Book Model
Add `categoryId` field:
```typescript
interface Book {
  // ...existing fields
  categoryId?: string;  // FK → Category.id, optional
}
```

### Step 6: Update Book Validator
```typescript
// book.validator.ts — add to CreateBookSchema
categoryId: z.string().uuid().optional(),
```

### Step 7: Update Book Service
When adding/updating a book, validate `categoryId` exists:
```typescript
if (request.categoryId) {
  const category = await db.findCategoryById(request.categoryId);
  if (!category) throw new Error('Category not found');
}
```

### Step 8: Category Frontend Page
Create `bookshop-frontend/src/pages/CategoriesPage.tsx` following the same pattern as `BooksPage.tsx` — table list, add/edit modal, delete with confirmation.

Register route in `App.tsx`:
```tsx
<Route path="categories" element={<CategoriesPage />} />
```

Add nav item in `Sidebar.tsx`.

### Step 9: Category Selector on Book Form
In `BooksPage.tsx` create/edit modal, add a category dropdown (reuse `Select` component) populated from a categories API call. Show current category in the books table as a badge.

### Step 10: Filter Books by Category
In `BooksPage.tsx`, add a category filter dropdown above the search bar. When selected, pass `?categoryId=` param to the backend. Add a `filterByCategory` query to the book service.

----------------------------------

## 🏷️ Phase 6: PostgreSQL Migration

### Migration Steps (In-Memory → PostgreSQL)

| # | Step | Description |
|---|------|-------------|
| 1 | Install `pg` | `npm install pg @types/pg` |
| 2 | Design schema | Create `schema.sql` with tables, FK, indexes, triggers |
| 3 | Implement `PostgresDatabase` | Same interface as `InMemoryDatabase`, using `pg.Pool` |
| 4 | Add `toCamelCase()` | Map `snake_case` DB columns to `camelCase` TypeScript |
| 5 | Transaction support | `BEGIN`/`COMMIT`/`ROLLBACK` via dedicated `PoolClient` |
| 6 | Database selector | `USE_IN_MEMORY` env var to switch between implementations |
| 7 | Seed script | `seed.ts` with sample data |
| 8 | Update services | Adapt transaction callback for both implementations |

### Key Architecture Decisions

**Transaction Pattern:** The `PostgresDatabase` stores a `txClient` reference during transactions. All `query()` calls inside a transaction use this dedicated client, ensuring atomicity:

```typescript
private async query(text: string, params?: any[]) {
  if (this.txClient) return this.txClient.query(text, params);
  return this.pool.query(text, params);
}

async transaction<T>(callback: (db: PostgresDatabase) => Promise<T>): Promise<T> {
  const client = await this.pool.connect();
  this.txClient = client;
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
    this.txClient = null;
  }
}
```

**Env-Based Selector:** Controlled by `.env`:
```
USE_IN_MEMORY=false          # true = in-memory, false = PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookshop
DB_USER=bookshop
DB_PASSWORD=bookshop
```

**Schema File:** `src/db/schema.sql` is idempotent (uses `IF NOT EXISTS`). Run once before first startup:
```bash
docker exec -i bookshop-pg psql -U bookshop -d bookshop < src/db/schema.sql
```

**Seed Data:**
```bash
npm run seed
```

---

## 📚 Quick Reference

### Business Rules
- Books: `context/02-domain/03-business-rules/book-rules.md`
- Categories: `context/02-domain/03-business-rules/category-rules.md`
- Customers: `context/02-domain/03-business-rules/customer-rules.md`
- Orders: `context/02-domain/03-business-rules/order-rules.md`

### API Contracts
- Books: `context/06-contracts/01-apis/rest/books.yaml`
- Categories: `context/06-contracts/01-apis/rest/categories.yaml`
- Customers: `context/06-contracts/01-apis/rest/customers.yaml`
- Orders: `context/06-contracts/01-apis/rest/orders.yaml`

### Module Specs
- Books: `context/05-modules/02-book-management/book-management.md`
- Categories: `context/05-modules/02-category-management/category-management.md`

----------------------------------

## 🏷️ Phase 7: Pagination

### Step 1: Pagination Utility
Create `bookshop-backend/src/utils/pagination.ts`:
```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
```

### Step 2: Pagination Validator Schema
Create `bookshop-backend/src/validators/pagination.validator.ts`:
```typescript
import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;
```

### Step 3: Update Repository Methods
In `PostgresDatabase`, update `findAllBooks`, `findAllCustomers`, `findAllOrders`, `searchBooks`, `searchCustomers` to accept `page` and `limit` and return `{ data: T[]; total: number }`:

```typescript
async findAllBooks(page: number, limit: number): Promise<{ data: Book[]; total: number }> {
  const offset = (page - 1) * limit;
  const [dataResult, countResult] = await Promise.all([
    this.query('SELECT * FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2', [offset, limit]),
    this.query('SELECT COUNT(*) as count FROM books'),
  ]);
  return {
    data: dataResult.rows.map(r => toCamelCase(r) as Book),
    total: parseInt(countResult.rows[0].count, 10),
  };
}
```

Apply the same pattern to `findAllCustomers`, `findAllOrders`, `searchBooks`, `searchCustomers`, `findOrdersByCustomerId`, `findOrdersByStatus`.

In `InMemoryDatabase`, paginate by slicing the sorted array and returning `Array.from(...).slice(offset, offset + limit)` with `total` set to the full array length.

### Step 4: Update Service Methods
Change service return types from `Promise<T[]>` to `Promise<{ data: T[]; pagination: PaginationMeta }>`. Services accept `page` and `limit`, pass them to repository, compute pagination metadata.

```typescript
// book.service.ts
async listBooks(page: number, limit: number) {
  const { data, total } = await db.findAllBooks(page, limit);
  return { data, pagination: buildPagination(page, limit, total) };
}
```

### Step 5: Update Route Handlers
In each list route, parse `page` and `limit` from `req.query` and pass to service:

```typescript
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await bookService.listBooks(page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 6: Frontend — API Modules
Update each API module to accept `{ page, limit }` and return the typed paginated response:

```typescript
// books.api.ts
getAll: (page = 1, limit = 20): Promise<{ data: Book[]; pagination: PaginationMeta }> =>
  apiClient.get(`/books?page=${page}&limit=${limit}`),
```

Add `PaginationMeta` to `src/types/index.ts`.

### Step 7: Frontend — Pagination Component
Create `src/components/common/Pagination.tsx`:
- Props: `{ page, totalPages, onPageChange, pageSize, onPageSizeChange, loading }`
- Renders Prev/Next buttons, page number buttons with ellipsis, page size selector (10/20/50)
- Disabled state when `loading` is true

### Step 8: Frontend — Update Hooks
Add `page`, `totalPages`, `setPage`, `setLimit` to each list hook. Reset to page 1 on search/filter change.

```typescript
// useBooks.ts
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const { data, pagination } = await booksApi.getAll(p, l);
      setBooks(data);
      setTotalPages(pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  return { books, loading, page, totalPages, setPage, setLimit, fetchBooks, ... };
}
```

### Step 9: Frontend — Integrate on Pages
Wrap each list page's Table with the Pagination component. Default to bottom of the table.

----------------------------------

## 🏷️ Phase 8: Stock Movement Log

### Step 1: Database Migration
Add to `schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS stock_movements (
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
```

### Step 2: Add Types
In `database.ts`:
```typescript
interface StockMovement {
  id: string;
  bookId: string;
  oldStock: number;
  newStock: number;
  quantity: number;
  reason: 'order_deduction' | 'manual_restock' | 'manual_adjustment' | 'correction';
  referenceId?: string;
  createdAt: Date;
}
```

### Step 3: Add Repository Methods
In `PostgresDatabase`:
```typescript
async recordStockMovement(movement: StockMovement): Promise<void> {
  await this.query(
    `INSERT INTO stock_movements (id, book_id, old_stock, new_stock, quantity, reason, reference_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [movement.id, movement.bookId, movement.oldStock, movement.newStock, movement.quantity, movement.reason, movement.referenceId || null, movement.createdAt]
  );
}

async getStockMovements(bookId: string, page: number, limit: number): Promise<{ data: StockMovement[]; total: number }> {
  const offset = (page - 1) * limit;
  const [dataResult, countResult] = await Promise.all([
    this.query('SELECT * FROM stock_movements WHERE book_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [bookId, offset, limit]),
    this.query('SELECT COUNT(*) as count FROM stock_movements WHERE book_id = $1', [bookId]),
  ]);
  return {
    data: dataResult.rows.map(r => toCamelCase(r) as StockMovement),
    total: parseInt(countResult.rows[0].count, 10),
  };
}

async adjustStock(bookId: string, newStock: number, reason: string, referenceId?: string): Promise<Book> {
  return await this.transaction(async (db) => {
    const book = await db.findBookById(bookId);
    if (!book) throw new Error('Book not found');
    const oldStock = book.stock;
    const quantity = newStock - oldStock;
    const updated = await db.updateBook(bookId, { stock: newStock });
    await db.recordStockMovement({
      id: uuidv4(),
      bookId,
      oldStock,
      newStock,
      quantity,
      reason: reason as StockMovement['reason'],
      referenceId,
      createdAt: new Date(),
    });
    return updated!;
  });
}
```

### Step 4: Create Stock Service
`bookshop-backend/src/services/stock.service.ts`:
```typescript
import { v4 as uuidv4 } from 'uuid';
import { db, StockMovement } from '../db/database';

class StockService {
  async getMovements(bookId: string, page = 1, limit = 20) {
    const { data, total } = await db.getStockMovements(bookId, page, limit);
    return { data, pagination: buildPagination(page, limit, total) };
  }

  async adjustStock(bookId: string, newStock: number, reason: string, referenceId?: string) {
    return await db.adjustStock(bookId, newStock, reason, referenceId);
  }
}

export const stockService = new StockService();
```

### Step 5: Create Stock Routes
`bookshop-backend/src/routes/stock.routes.ts`:
```typescript
const router = Router();

router.get('/books/:id/stock-movements', async (req, res) => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await stockService.getMovements(req.params.id, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/books/:id/stock-adjust', async (req, res) => {
  try {
    const schema = z.object({ newStock: z.number().int().min(0), reason: z.enum(['manual_restock', 'manual_adjustment', 'correction']) });
    const { newStock, reason } = schema.parse(req.body);
    const book = await stockService.adjustStock(req.params.id, newStock, reason);
    res.json(book);
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: error.errors });
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Mount in `index.ts`: `app.use('/api/v1', stockRouter)`

### Step 6: Integrate with Order Creation
In `orderService.createOrder()`, call `stockService.recordStockMovement` after deducting stock:

```typescript
// Inside transaction in orderService.createOrder
await db.recordStockMovement({
  id: uuidv4(),
  bookId: order.bookId,
  oldStock: book.stock,
  newStock: book.stock - request.quantity,
  quantity: -request.quantity,
  reason: 'order_deduction',
  referenceId: order.id,
  createdAt: new Date(),
});
```

### Step 7: Frontend — API & Hook
- `src/types/index.ts`: add `StockMovement` interface
- `src/api/stock.api.ts`: `getMovements(bookId, page, limit)`, `adjustStock(bookId, newStock, reason)`
- `src/hooks/useStockMovements.ts`: fetch movements for a book with pagination state

### Step 8: Frontend — UI
- Add "Stock History" button per book row in `BooksPage` that opens a modal with paginated movements table
- Dashboard: add "Recent Stock Activity" card showing the latest 10 movements across all books (use a new endpoint or filter)

----------------------------------

## 🏷️ Phase 9: Audit Log

### Step 1: Database Migration
Add to `schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  previous_state JSONB,
  new_state JSONB,
  performed_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);
```

### Step 2: Add Types
In `database.ts`:
```typescript
interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  previousState?: any;
  newState?: any;
  performedBy: string;
  createdAt: Date;
}
```

### Step 3: Add Repository Methods
```typescript
async createAuditLog(entry: AuditEntry): Promise<void> {
  await this.query(
    `INSERT INTO audit_log (id, entity_type, entity_id, action, previous_state, new_state, performed_by, created_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)`,
    [entry.id, entry.entityType, entry.entityId, entry.action,
     entry.previousState ? JSON.stringify(entry.previousState) : null,
     entry.newState ? JSON.stringify(entry.newState) : null,
     entry.performedBy, entry.createdAt]
  );
}

async getAuditLog(filters: { entityType?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; page: number; limit: number }): Promise<{ data: AuditEntry[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (filters.entityType) { conditions.push(`entity_type = $${idx++}`); params.push(filters.entityType); }
  if (filters.entityId) { conditions.push(`entity_id = $${idx++}`); params.push(filters.entityId); }
  if (filters.action) { conditions.push(`action = $${idx++}`); params.push(filters.action); }
  if (filters.fromDate) { conditions.push(`created_at >= $${idx++}`); params.push(filters.fromDate); }
  if (filters.toDate) { conditions.push(`created_at <= $${idx++}`); params.push(filters.toDate); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (filters.page - 1) * filters.limit;

  const [dataResult, countResult] = await Promise.all([
    this.query(`SELECT * FROM audit_log ${where} ORDER BY created_at DESC OFFSET $${idx} LIMIT $${idx + 1}`, [...params, offset, filters.limit]),
    this.query(`SELECT COUNT(*) as count FROM audit_log ${where}`, params),
  ]);

  return {
    data: dataResult.rows.map(r => toCamelCase(r) as AuditEntry),
    total: parseInt(countResult.rows[0].count, 10),
  };
}
```

### Step 4: Create Audit Service
`bookshop-backend/src/services/audit.service.ts`:
```typescript
import { v4 as uuidv4 } from 'uuid';
import { db, AuditEntry } from '../db/database';

class AuditService {
  async log(entityType: string, entityId: string, action: string, previousState: any, newState: any, performedBy = 'system') {
    const entry: AuditEntry = {
      id: uuidv4(),
      entityType,
      entityId,
      action: action as AuditEntry['action'],
      previousState,
      newState,
      performedBy,
      createdAt: new Date(),
    };
    await db.createAuditLog(entry);
  }

  async getLogs(filters: { entityType?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const { data, total } = await db.getAuditLog({ ...filters, page, limit });
    return { data, pagination: buildPagination(page, limit, total) };
  }
}

export const auditService = new AuditService();
```

### Step 5: Wire Into Existing Services
Modify each service method to log after successful operations:

```typescript
// book.service.ts addBook
async addBook(request: CreateBookRequest): Promise<Book> {
  // ... existing creation logic ...
  const book = await db.createBook(bookData);
  await auditService.log('book', book.id, 'created', null, book);
  return book;
}

// book.service.ts updateBook
async updateBook(id: string, request: UpdateBookRequest): Promise<Book> {
  const existing = await db.findBookById(id);
  if (!existing) throw new Error('Book not found');
  const updated = await db.updateBook(id, request);
  await auditService.log('book', id, 'updated', existing, updated);
  return updated!;
}

// book.service.ts deleteBook
async deleteBook(id: string): Promise<void> {
  const existing = await db.findBookById(id);
  if (!existing) throw new Error('Book not found');
  await db.deleteBook(id);
  await auditService.log('book', id, 'deleted', existing, null);
}
```

Apply the same pattern to `customerService` and `orderService` (including status transitions).

### Step 6: Create Audit Routes
`bookshop-backend/src/routes/audit.routes.ts`:
```typescript
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = z.object({
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      action: z.enum(['created', 'updated', 'deleted']).optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(req.query);
    const result = await auditService.getLogs(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Mount in `index.ts`: `app.use('/api/v1/audit-log', auditRouter)`

### Step 7: Frontend — API & Hook
- `src/types/index.ts`: add `AuditEntry` interface
- `src/api/audit.api.ts`: `getAll(filters)` method
- `src/hooks/useAuditLog.ts`: fetch with filter state and pagination

### Step 8: Frontend — Audit Log Page
Create `AuditLogPage.tsx`:
- Filter bar: entity type dropdown (all/books/customers/orders), action dropdown, date range pickers, entity ID input
- Paginated table: Timestamp | Entity Type | Entity ID | Action | Performed By | "View Details" (expand previous/new state JSON)
- Add route in `App.tsx`: `<Route path="audit-log" element={<AuditLogPage />} />`
- Add "Audit Log" link in sidebar navigation

----------------------------------

## 🏷️ Phase 10: Export CSV

### Step 1: CSV Utility
Create `bookshop-backend/src/utils/csv.ts`:
```typescript
interface CsvColumn<T> {
  key: keyof T;
  header: string;
}

function escapeCsvValue(value: any): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const bom = '\uFEFF';
  const header = columns.map(c => c.header).join(',');
  const rows = data.map(item =>
    columns.map(c => escapeCsvValue(item[c.key])).join(',')
  );
  return bom + header + '\n' + rows.join('\n');
}
```

### Step 2: Create Export Service
`bookshop-backend/src/services/export.service.ts`:
```typescript
import { db } from '../db/database';
import { toCsv } from '../utils/csv';

class ExportService {
  async exportBooks(filters?: Record<string, any>): Promise<string> {
    const books = await db.findAllBooks(filters);
    return toCsv(books, [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'author', header: 'Author' },
      { key: 'price', header: 'Price' },
      { key: 'stock', header: 'Stock' },
      { key: 'categoryId', header: 'Category ID' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'updatedAt', header: 'Updated At' },
    ]);
  }

  async exportCustomers(): Promise<string> {
    const customers = await db.findAllCustomers();
    return toCsv(customers, [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'address', header: 'Address' },
      { key: 'createdAt', header: 'Created At' },
    ]);
  }

  async exportOrders(filters?: Record<string, any>): Promise<string> {
    const orders = await db.findAllOrders(filters);
    return toCsv(orders, [
      { key: 'id', header: 'ID' },
      { key: 'customerId', header: 'Customer ID' },
      { key: 'bookId', header: 'Book ID' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'totalPrice', header: 'Total Price' },
      { key: 'status', header: 'Status' },
      { key: 'createdAt', header: 'Created At' },
    ]);
  }
}

export const exportService = new ExportService();
```

### Step 3: Create Export Routes
`bookshop-backend/src/routes/export.routes.ts`:
```typescript
import { Router, Request, Response } from 'express';
import { exportService } from '../services/export.service';

const router = Router();
const validEntities = ['books', 'customers', 'orders'] as const;

router.get('/:entity', async (req: Request, res: Response) => {
  const { entity } = req.params;
  if (!validEntities.includes(entity as any)) {
    return res.status(400).json({ error: `Invalid entity. Valid: ${validEntities.join(', ')}` });
  }

  try {
    const csv = await exportService[`export${entity.charAt(0).toUpperCase() + entity.slice(1)}` as 'exportBooks' | 'exportCustomers' | 'exportOrders'](req.query);
    const filename = `${entity}-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Mount in `index.ts`: `app.use('/api/v1/export', exportRouter)`

### Step 4: Frontend — Export API
`src/api/export.api.ts`:
```typescript
import apiClient from './client';

export const exportApi = {
  downloadCsv: (entity: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    const url = `${apiClient.defaults.baseURL}/export/${entity}${params ? '?' + params : ''}`;
    window.open(url, '_blank');
  },
};
```

### Step 5: Frontend — Add Buttons
On each list page (`BooksPage`, `CustomersPage`, `OrdersPage`), add an "Export CSV" button next to the "Add" button in the page header. For orders, pass current status filter:

```tsx
<Button variant="secondary" onClick={() => exportApi.downloadCsv('orders', selectedStatus ? { status: selectedStatus } : undefined)}>
  Export CSV
</Button>
```

---

----------------------------------

## 🏷️ Phase 11: Book Cover Images + Card View

### Step 1: Install S3 SDK
Remove Supabase SDK, install AWS S3 client:
```bash
npm uninstall @supabase/supabase-js
npm install @aws-sdk/client-s3
```

### Step 2: Add Env Vars
In `.env`:
```
S3_ENDPOINT=https://muuqwtwyvzhphuitmdfi.supabase.co/storage/v1/s3
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=book-covers
```

### Step 3: Create S3 Client Utility
`bookshop-backend/src/utils/s3.ts`:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

export async function uploadBookCover(bookId: string, file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split('.').pop() || 'jpg';
  const key = `books/${bookId}/${Date.now()}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || 'book-covers',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
  return publicUrl;
}
```

### Step 4: Update Upload Route
`bookshop-backend/src/routes/upload.routes.ts` — same endpoint `POST /books/:id/cover`, but use S3 client instead of Supabase SDK. Remove Supabase check, add S3 env check.

### Step 5: Database Schema
Already done — `cover_url VARCHAR(500)` added to `books` table.

### Step 6: Remove Cover URL Text Field from Book Form
In `BooksPage.tsx`:
- Remove the URL text input for cover image
- Add a file input (`<input type="file" accept="image/*">`) that uploads via the `/books/:id/cover` endpoint
- Show preview of uploaded image before saving

### Step 7: Card/Grid View Toggle
Already done — `viewMode` state (`'list' | 'grid'`) with `ListBulletIcon`/`Squares2X2Icon` toggle buttons. Grid renders book cards with cover image or initial-letter placeholder.

### Step 8: Update API Contracts
Add upload endpoint to `books.yaml`:
```yaml
  /books/{bookId}/cover:
    post:
      summary: Upload book cover image
      parameters:
        - name: bookId
          in: path
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                cover:
                  type: string
                  format: binary
      responses:
        '200':
          description: Cover uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  coverUrl: { type: string }
                  book: { $ref: '#/components/schemas/Book' }
```

---

----------------------------------

## 🏷️ Phase 12: UI Design Polish

### Step 1: Update Tailwind Config
Edit `tailwind.config.js`:
- Add brand gradient colors: `indigo-600`, `violet-600`, `purple-600`
- Add new box shadows: `card-hover` with stronger blur, `modal` shadow
- Add `shimmer` keyframe animation (gradient sweep for skeletons)
- Add `icon-slide` keyframe for button icon hover
- Import `@tailwindcss/forms` plugin for better form styling

### Step 2: Update Global CSS (`index.css`)
- Add shimmer keyframe: `@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`
- Add `.shimmer` utility class: `bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer`
- Keep existing `.card` / `.card-hover` classes, enhance `.card-hover` with `hover:scale-[1.01]`

### Step 3: Update Sidebar (`layouts/Sidebar.tsx`)
- Logo area: change `bg-blue-600` to `bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600`
- Active nav item: replace solid `bg-blue-600` with `border-l-3 border-indigo-400 bg-gray-800/50` left-border accent
- Add user avatar placeholder at bottom: `w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold`

### Step 4: Update Card (`components/common/Card.tsx`)
- Add hover state: `hover:scale-[1.01] hover:border-gray-300 hover:shadow-card-hover transition-all duration-200`

### Step 5: Update Modal (`components/common/Modal.tsx`)
- Change overlay from `bg-black/50` to `bg-black/40 backdrop-blur-sm`
- Add `animate-fade-in` on the dialog card

### Step 6: Update Button (`components/common/Button.tsx`)
- Add icon slide: wrap children in detection — if child is an icon + text pair, add `group` class to button and `group-hover:translate-x-0.5 transition-transform` to icon
- Update primary variant from `bg-blue-600` to `bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700`

### Step 7: Update PageHeader (`layouts/PageHeader.tsx`)
- Title: change from `text-3xl font-bold` to `text-3xl font-semibold tracking-tight`
- Add subtle gradient underline: `decoration-2 decoration-indigo-500/30 underline-offset-4` (optional)

### Step 8: Update SearchInput (`components/common/SearchInput.tsx`)
- Change `rounded-md` to `rounded-full`
- Add `pl-10 pr-10` for better pill proportions
- Add `shadow-sm` for subtle depth

### Step 9: Update HomePage Skeletons (`pages/HomePage.tsx`)
- Replace `animate-pulse bg-gray-200` with `shimmer` class (shimmer gradient sweep)
- Use `bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer` instead of `animate-pulse`

### Step 10: Apply Brand Gradient to Key Elements
- `HomePage.tsx`: Stats card icon containers — change from solid `bg-blue-50` to `bg-gradient-to-br from-indigo-50 to-blue-50`
- `BooksPage.tsx`: view mode toggle active state — apply brand gradient background
- `PageHeader.tsx`: bottom border — from `border-gray-200` to `border-gray-200/80`

### Step 11: Update Context Docs
- Reflect all new design tokens in `07-design-system/01-foundation/ui-design-context.md`
- Update color palette with new gradient tokens
- Update component specs with new patterns

---

----------------------------------

## 🏷️ Phase 13: Shopping Cart

### Step 1: Cart Types & localStorage Hook
Create `bookshop-frontend/src/types/cart.ts`:
```typescript
export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverUrl?: string;
  categoryId?: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}
```

Create `bookshop-frontend/src/hooks/useCart.ts`:
```typescript
// localStorage-backed cart hook
// - loadCart(): reads from localStorage key 'bookshop-cart'
// - saveCart(cart): writes to localStorage
// - addItem(book, qty = 1): adds or increments quantity
// - removeItem(bookId): removes item entirely
// - updateQuantity(bookId, qty): sets exact quantity (min 0 = remove)
// - clearCart(): empties cart
// - totalItems: computed count of all items
// - subtotal: computed sum of price * qty per item
// - Notify via showToast() on each action
```

### Step 2: Add to Cart Button on BooksPage
- In the table column for actions, add an "Add to Cart" button (ShoppingCartIcon, outline)
- In grid view, add the button to the bottom of each card (next to edit/delete)
- On click: call `addItem(book)` → show success toast → update sidebar badge
- Disable the button or show warning if stock is 0 (out of stock)

### Step 3: Cart Drawer Component
Create `bookshop-frontend/src/components/cart/CartDrawer.tsx`:
```tsx
<CartDrawer isOpen onClose>
  {/* Overlay with backdrop-blur-sm */}
  {/* Slide-in panel from right: w-[400px] max-w-full */}
  {/* Header: "Shopping Cart (N items)" + close X button */}
  {/* Items list: scrollable */}
  {/* Each item: cover thumbnail 48x64 | title + author | qty stepper | price | remove */}
  {/* Footer: subtotal line, total line, "Checkout" button (disabled for now or placeholder) */}
</CartDrawer>
```

Quantity stepper: `-` button → `qty` → `+` button. Min 1, show warning if qty exceeds stock.

### Step 4: Cart Icon with Badge in Sidebar
Add a "Cart" nav item below Orders in the sidebar:
```tsx
// Inside the NavLink, after the icon:
{items.length > 0 && (
  <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
    {totalItems}
  </span>
)}
```
Clicking the cart nav item opens the drawer (state lifted to MainLayout or use a context).

### Step 5: Toast Notifications
Wire cart actions to existing toast system:
- `addItem` → "Added {title} to cart" (success toast)
- `removeItem` → "Removed {title} from cart" (info toast)
- `updateQuantity` → subtle, no toast unless qty reaches 0

### Step 6: Backend — Cart Validate Endpoint
Create `bookshop-backend/src/routes/cart.routes.ts`:
```
POST /api/v1/cart/validate
Body: { items: [{ bookId: string, quantity: number }] }
Response: { valid: boolean, errors: [{ bookId, title, requested, available }] }
Logic: For each item, look up book by ID, compare quantity against stock
```

### Step 7: Backend — Cart Checkout Endpoint
```
POST /api/v1/cart/checkout
Body: { items: [{ bookId: string, quantity: number }], customerId: string }
Response: { orderId, items: [...], totalPrice, status: 'pending' }
Logic (transactional):
  1. Validate stock for ALL items (fail if any insufficient)
  2. Create an order record (link to customer)
  3. Deduct stock for each book
  4. Record stock movement per item (reason: 'order_deduction')
  5. Record audit log entry
  6. Return created order with items
```

Note: The current schema has orders as single-book records. The checkout may need a new `cart_orders` table or the existing order schema adapted to support multiple items. Options:
- **Option A (simpler):** Create one order per cart item (reuse existing `orders` table)
- **Option B (better):** New `cart_checkouts` table with line items for multi-item orders

### Step 8: Update Database Schema (if Option B)
Cart checkout table:
```sql
CREATE TABLE IF NOT EXISTS cart_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES cart_checkouts(id),
  book_id UUID NOT NULL REFERENCES books(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```

### Step 9: Update API Contracts
Create `06-contracts/01-apis/rest/cart.yaml` with:
- `CartItem` schema
- `CartValidateRequest` / `CartValidateResponse`
- `CheckoutRequest` / `CheckoutResponse`

### Step 10: Wire Frontend to Backend
- After successful checkout API call, clear the local cart
- Show success toast with order ID
- Navigate to orders page or show order summary
- On cart open, optionally call validate endpoint to flag stock issues

----------------------------------

## 🏷️ Phase 14: BookHouse Rebrand

### Step 1: Create Vintage Badge SVG Logo
Create an inline SVG component at `src/components/common/BookHouseLogo.tsx`:
- Circular badge with double-ring border (outer thick, inner thin)
- "BOOK" text at top (horizontal, centered)
- "HOUSE" text at bottom (horizontal, centered)
- Center icon: an open book with a house roof line above it
- Small decorative dots/stars on left and right of center
- Colors: brand gradient (from-indigo-500 via-blue-500 to-purple-500) for the badge fill, white for text and icon
- Size: `w-10 h-10` (40x40px) for sidebar, scalable via prop

### Step 2: Sidebar Update
- Import and render `<BookHouseLogo />` instead of the current "B" letter box
- Change link text from "Bookshop" to "BookHouse"
- Adjust logo container to `w-10 h-10` for better badge visibility

### Step 3: Page Titles Update
- `pages/HomePage.tsx`: Change "Bookshop Management" → "BookHouse" in the heading and subtitle
- `layouts/PageHeader.tsx`: No change needed (title is dynamic)
- Any other hardcoded "Bookshop" references in pages

### Step 4: HTML Title + Favicon
- `index.html`: Change `<title>` from "Bookshop Management System" → "BookHouse — Vintage Bookstore Management"

### Step 5: Update Context Docs
- `ui-design-context.md`: Rename "Bookshop Management System" to "BookHouse" in page title role and header references
- Update sidebar spec diagram text

----------------------------------

## 🏷️ Phase 15: Favourites (Wishlist)

### Step 1: Create `useFavorites` Hook
File: `src/hooks/useFavorites.ts`
- localStorage-backed hook storing an array of book IDs
- `favorites: string[]` — list of book UUIDs
- `toggleFavorite(bookId: string)` — add if absent, remove if present
- `isFavorite(bookId: string): boolean`
- `addFavorite(bookId: string)`, `removeFavorite(bookId: string)`
- `favoriteCount: number`
- Align with the `useCart` pattern (same localStorage + getter pattern)

### Step 2: Create `FavoritesContext`
File: `src/context/FavoritesContext.tsx`
- Wraps `useFavorites` to share state across the app
- Provides: `favorites`, `toggleFavorite`, `isFavorite`, `favoriteCount`
- Integrates toast notifications on add/remove
- Pattern matches `CartContext.tsx`

### Step 3: Add Heart Toggle to BooksPage
- In list view (`BooksTable`): add a heart icon column before actions — filled heart (❤️) when favourited, outline heart (♡) when not
- In grid view (`BookCard`): add a heart icon button in the top-right corner of the card
- Heart icon colors: `text-red-400` filled, `text-gray-300` outline
- Hover: `hover:text-red-400` transition
- Wrap in `FavoritesContext`

### Step 4: Create Favourites Page
File: `src/pages/FavouritesPage.tsx`
- Route: `/favourites`
- Reads `favorites` array from context, fetches full book data via `useBooks` or by passing IDs
- Displays books in a clean table (similar to books list)
- Each row has a checkbox for selection
- "Add Selected to Cart" button in the header (enabled when ≥1 book selected)
- On click: calls `addItem` from cart context for each selected book, shows toast "Added X books to cart"
- Empty state: "No favourites yet. Browse books and tap the heart icon to save them."

### Step 5: Add Sidebar Nav Item
- Add to `Sidebar.tsx` nav items: `{ to: '/favourites', label: 'Favourites', icon: HeartIcon }`
- Show `favoriteCount` badge next to the label (gradient badge, same style as cart badge)
- Use `HeartIcon` from `@heroicons/react/24/outline`

### Step 6: Wire into App.tsx
- Import `FavoritesProvider` and wrap app
- Import `FavouritesPage` route at `/favourites`

### Step 7: Add Batch Remove + Clear All
- In `FavouritesPage.tsx`:
  - Add a "Remove Selected" `Button` in the `PageHeader` `action` alongside "Add Selected to Cart" (shows when `selected.length > 0`)
  - On click: iterate selected IDs, call `removeFavorite` for each, clear selection, show toast
  - Add a "Clear All" text button below the select-all bar (or in header)
  - On click: `clearFavorites()`, clear selection, show toast "All favourites cleared"

----------------------------------

## 🏷️ Phase 16: Monthly Sales Analytics Panel

### Prerequisites
- Orders table exists with `created_at`, `total_price`, `quantity`, `status` columns
- No new database tables required — pure aggregation queries

### Step 1: Backend — Analytics Route & Endpoint

Create `bookshop-backend/src/routes/analytics.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { db } from '../db/database';

const router = Router();

// GET /api/v1/analytics/sales-by-month
// Returns monthly aggregated sales data
router.get('/sales-by-month', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(DISTINCT id) AS total_orders,
        SUM(quantity) AS books_sold,
        SUM(total_price) AS revenue,
        ROUND(AVG(total_price), 2) AS avg_order_value
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // For each month, find the top-selling book
    const monthlyData = await Promise.all(
      result.rows.map(async (row: any) => {
        const topBook = await db.query(`
          SELECT b.title, SUM(o.quantity) as total_sold
          FROM orders o
          JOIN books b ON o.book_id = b.id
          WHERE DATE_TRUNC('month', o.created_at) = $1
            AND o.status != 'cancelled'
          GROUP BY b.id, b.title
          ORDER BY total_sold DESC
          LIMIT 1
        `, [row.month]);

        return {
          month: row.month,
          totalOrders: parseInt(row.total_orders, 10),
          booksSold: parseInt(row.books_sold, 10),
          revenue: parseFloat(row.revenue),
          avgOrderValue: parseFloat(row.avg_order_value),
          topBook: topBook.rows[0]?.title || null,
        };
      })
    );

    // Calculate trend arrows (compare each month with previous)
    const withTrend = monthlyData.map((curr, i) => ({
      ...curr,
      trend: i < monthlyData.length - 1
        ? curr.revenue >= monthlyData[i + 1].revenue ? 'up' : 'down'
        : 'flat',
      trendPercent: i < monthlyData.length - 1 && monthlyData[i + 1].revenue > 0
        ? Math.round(((curr.revenue - monthlyData[i + 1].revenue) / monthlyData[i + 1].revenue) * 100)
        : 0,
    }));

    // Compute summary for current month
    const currentMonth = withTrend[0] || null;
    const summary = currentMonth ? {
      currentMonthRevenue: currentMonth.revenue,
      currentMonthOrders: currentMonth.totalOrders,
      currentMonthBooksSold: currentMonth.booksSold,
      trend: currentMonth.trend,
      trendPercent: currentMonth.trendPercent,
      ytdRevenue: monthlyData
        .filter(m => new Date(m.month).getFullYear() === new Date().getFullYear())
        .reduce((sum, m) => sum + m.revenue, 0),
    } : null;

    res.json({ summary, months: withTrend });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Mount in `index.ts`:
```typescript
import analyticsRouter from './routes/analytics.routes';
app.use('/api/v1/analytics', analyticsRouter);
```

### Step 2: Backend — Add Month Filter to Orders Endpoint

In `bookshop-backend/src/routes/orders.ts`, add an optional `month` query param (format `YYYY-MM`):

```typescript
// Add to existing GET / route
const monthFilter = req.query.month as string | undefined;
// If monthFilter is provided, add WHERE clause:
// WHERE DATE_TRUNC('month', created_at) = $X
```

Update `order.service.ts` to accept `month` param.

### Step 3: Frontend — API Module & Hook

Create `bookshop-frontend/src/api/analytics.api.ts`:
```typescript
import apiClient from './client';

export interface MonthlySales {
  month: string;
  totalOrders: number;
  booksSold: number;
  revenue: number;
  avgOrderValue: number;
  topBook: string | null;
  trend: 'up' | 'down' | 'flat';
  trendPercent: number;
}

export interface AnalyticsSummary {
  currentMonthRevenue: number;
  currentMonthOrders: number;
  currentMonthBooksSold: number;
  trend: string;
  trendPercent: number;
  ytdRevenue: number;
}

export const analyticsApi = {
  getSalesByMonth: (): Promise<{ summary: AnalyticsSummary; months: MonthlySales[] }> =>
    apiClient.get('/analytics/sales-by-month'),
};
```

Create `bookshop-frontend/src/hooks/useAnalytics.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, MonthlySales, AnalyticsSummary } from '../api/analytics.api';

export function useAnalytics() {
  const [months, setMonths] = useState<MonthlySales[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getSalesByMonth();
      setMonths(data.months);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { months, summary, loading, error, refetch: fetch };
}
```

### Step 4: Frontend — Analytics Panel Component

Create `bookshop-frontend/src/pages/components/MonthlySalesPanel.tsx`:

```tsx
// Displays:
// 1. Summary bar: "This Month: ৳X (↑Y% from last month) · YTD: ৳Z"
// 2. Table: Month | Orders | Books Sold | Revenue | Avg Value | Top Book | Trend
// 3. Each month row is clickable → navigates to /orders?month=YYYY-MM
// 4. Loading state: shimmer skeleton placeholder
// 5. Empty state: "No orders yet. Start by creating an order."
// 6. Error state: alert with retry button
```

Place it on the HomePage above the existing stats cards.

### Step 5: Frontend — Wire Month Click to Orders Page

In `MonthlySalesPanel.tsx`, use `useNavigate` from `react-router-dom` to navigate:
```tsx
const navigate = useNavigate();
// On row click:
navigate(`/orders?month=${month}`);
```

In `OrdersPage.tsx`, read `month` from URL search params and pass it to the orders API call:
```tsx
const [searchParams] = useSearchParams();
const monthFilter = searchParams.get('month') || undefined;
// Pass to useOrders hook
```

Update `useOrders` hook and `orders.api.ts` to support `month` param.

### Step 6: Update Context Docs

Create `bookshop-product-context/06-contracts/01-apis/rest/analytics.yaml`:
```yaml
openapi: 3.0.3
info:
  title: Analytics API
  version: 1.0.0
paths:
  /api/v1/analytics/sales-by-month:
    get:
      summary: Get monthly sales data
      responses:
        '200':
          description: Monthly sales aggregated
          content:
            application/json:
              schema:
                type: object
                properties:
                  summary:
                    type: object
                    properties:
                      currentMonthRevenue: { type: number }
                      currentMonthOrders: { type: integer }
                      currentMonthBooksSold: { type: integer }
                      trend: { type: string, enum: [up, down, flat] }
                      trendPercent: { type: integer }
                      ytdRevenue: { type: number }
                  months:
                    type: array
                    items:
                      type: object
                      properties:
                        month: { type: string, format: date }
                        totalOrders: { type: integer }
                        booksSold: { type: integer }
                        revenue: { type: number }
                        avgOrderValue: { type: number }
                        topBook: { type: string, nullable: true }
                        trend: { type: string, enum: [up, down, flat] }
                        trendPercent: { type: integer }
```

Update `business-rules/order-rules.md` if needed (no rule changes expected).

----------------------------------

## 🚀 Ready to Code!

Start with **US-001: Add Book** - it's the foundation for everything else.

Reference the context repo for WHAT to build, and implement HOW in your backend repo.

Good luck! 🎉
