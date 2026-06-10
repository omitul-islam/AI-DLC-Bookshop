# Backend Architecture

## Purpose
Technical architecture and design decisions for the Bookshop Management System backend API.

---

## Technology Stack

### Core
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express 4.18+
- **Package Manager**: npm

### Validation
- **Zod**: ^3.22.0
- Schema-based validation
- Type inference

### Database
- **Development**: In-memory (for quick start)
- **Production**: PostgreSQL 14+ (recommended)
- **ORM**: pg (PostgreSQL client) or Prisma (future)

### Utilities
- **UUID**: ^9.0.0 - Unique IDs
- **dotenv**: ^16.0.0 - Environment config
- **cors**: ^2.8.0 - CORS support

---

## Project Structure

```
bookshop-backend/
├── src/
│   ├── db/                      # Database layer
│   │   └── database.ts          # Database abstraction
│   ├── validators/              # Zod validation schemas
│   │   ├── book.validator.ts
│   │   ├── customer.validator.ts
│   │   └── order.validator.ts
│   ├── services/                # Business logic layer
│   │   ├── book.service.ts
│   │   ├── customer.service.ts
│   │   └── order.service.ts
│   ├── routes/                  # API routes/controllers
│   │   ├── books.ts
│   │   ├── customers.ts
│   │   └── orders.ts
│   ├── middleware/              # Express middleware (future)
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── types/                   # TypeScript types
│   │   └── express.d.ts
│   └── index.ts                 # Express app setup
├── tests/                       # Test files (future)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Layered Architecture

### Layer Separation

```
┌─────────────────────────────────────┐
│       API Layer (Routes)            │  ← HTTP requests/responses
├─────────────────────────────────────┤
│      Service Layer (Business)       │  ← Business logic
├─────────────────────────────────────┤
│     Repository Layer (Data)         │  ← Data access
├─────────────────────────────────────┤
│       Database (PostgreSQL)         │  ← Persistence
└─────────────────────────────────────┘
```

### Responsibilities

**API Layer** (Routes/Controllers)
- HTTP request/response handling
- Input validation (Zod)
- Response formatting
- Error status codes

**Service Layer** (Business Logic)
- Business rule enforcement
- Transaction management
- Domain logic
- Service orchestration

**Repository Layer** (Data Access)
- Database queries
- CRUD operations
- Data transformation
- Query optimization

---

## API Layer Pattern

### Route Structure
```typescript
// routes/books.ts
import { Router } from 'express';
import { bookService } from '../services/book.service';
import { CreateBookSchema } from '../validators/book.validator';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // 1. Validate input (Zod)
    const validated = CreateBookSchema.parse(req.body);
    
    // 2. Call service layer
    const book = await bookService.addBook(validated);
    
    // 3. Return response
    res.status(201).json(book);
  } catch (error) {
    // 4. Handle errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatZodErrors(error)
      });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Error Handling Pattern
- Zod validation errors → 400 Bad Request
- Business rule violations → 400 Bad Request
- Not found → 404 Not Found
- Server errors → 500 Internal Server Error

---

## Service Layer Pattern

### Business Logic Enforcement
```typescript
// services/book.service.ts
export class BookService {
  async addBook(request: CreateBookRequest): Promise<Book> {
    // Business rules already enforced by Zod validation
    // BR-BOOK-001: Required fields
    // BR-BOOK-002: Price >= 0
    // BR-BOOK-003: Stock >= 0
    
    const book: Book = {
      id: uuidv4(),
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.createBook(book);
  }

  async updateBook(id: string, request: UpdateBookRequest): Promise<Book> {
    // BR-BOOK-004: Verify book exists
    const existing = await db.findBookById(id);
    if (!existing) {
      throw new Error('Book not found');
    }

    // Merge updates
    const updated = await db.updateBook(id, request);
    return updated;
  }
}
```

### Transaction Pattern (Orders)
```typescript
// services/order.service.ts
export class OrderService {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    return await db.transaction(async (trx) => {
      // 1. Validate customer exists (BR-ORDER-010)
      const customer = await trx.findCustomerById(request.customerId);
      if (!customer) throw new Error('Customer not found');

      // 2. Validate book exists and stock (BR-ORDER-001)
      const book = await trx.findBookById(request.bookId);
      if (!book) throw new Error('Book not found');
      
      if (book.stock < request.quantity) {
        throw new InsufficientStockError(request.quantity, book.stock);
      }

      // 3. Create order
      const order = await trx.createOrder({
        id: uuidv4(),
        ...request,
        totalPrice: book.price * request.quantity,
        status: 'pending',
      });

      // 4. Reduce stock (BR-ORDER-002)
      await trx.updateBook(request.bookId, {
        stock: book.stock - request.quantity
      });

      // Transaction commits if all succeed
      return order;
    });
  }
}
```

---

## Validation Layer

### Zod Schemas (from Business Rules)
```typescript
// validators/book.validator.ts
import { z } from 'zod';

// BR-BOOK-001, BR-BOOK-002, BR-BOOK-003
export const CreateBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  price: z.number().min(0, 'Price must be zero or greater'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock must be zero or greater'),
});

export type CreateBookRequest = z.infer<typeof CreateBookSchema>;
```

### Validation Flow
1. Request arrives
2. Route handler calls `Schema.parse(req.body)`
3. If valid → proceed to service
4. If invalid → throw ZodError → 400 response

---

## Database Layer

See dedicated [Database Design](../02-database-design/database-design.md) for full schema, data models, and migration plan.

### Current: In-Memory
- `Map<string, T>` storage per entity
- No external dependencies
- Data resets on restart
- Transaction pass-through for order atomicity

### Target: PostgreSQL
- ACID-compliant relational database
- UUID primary keys
- Parameterized queries
- Full schema and indexing strategy in database-design.md

### Repository Pattern (Future)
```typescript
export class BookRepository {
  async create(book: Book): Promise<Book> {
    const result = await pool.query(
      'INSERT INTO books (id, title, author, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [book.id, book.title, book.author, book.price, book.stock]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<Book | null> {
    const result = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}
```

---

## Business Rules Implementation

### Traceability to Context

Every business rule from context is enforced:

**Book Rules** (`context/02-domain/03-business-rules/book-rules.md`)
- BR-BOOK-001 → `CreateBookSchema` required fields
- BR-BOOK-002 → `price.min(0)` in Zod
- BR-BOOK-003 → `stock.int().min(0)` in Zod
- BR-BOOK-004 → `bookService.updateBook()` existence check
- BR-BOOK-005 → `bookService.deleteBook()` existence check
- BR-BOOK-006 → `SearchQuerySchema` validation
- BR-BOOK-007 → `db.searchBooks()` case-insensitive matching

**Customer Rules** (`context/02-domain/03-business-rules/customer-rules.md`)
- BR-CUSTOMER-001 → `CreateCustomerSchema` required
- BR-CUSTOMER-002 → `email()` format validation
- BR-CUSTOMER-003 → `customerService.addCustomer()` uniqueness check
- BR-CUSTOMER-004 → `phone.regex()` format validation

**Order Rules** (`context/02-domain/03-business-rules/order-rules.md`)
- BR-ORDER-001 → `orderService.createOrder()` stock check
- BR-ORDER-002 → Automatic stock deduction in transaction
- BR-ORDER-003 → Stock validation prevents negative
- BR-ORDER-004 → Status workflow constants
- BR-ORDER-005 → `orderService.updateOrderStatus()` transition logic
- BR-ORDER-007 → `quantity.min(1)` in Zod
- BR-ORDER-010 → Customer existence check

---

## API Endpoints

### REST API Structure

Following OpenAPI contracts in `context/06-contracts/01-apis/rest/`

**Books** (`/api/v1/books`)
```
POST   /          → addBook (US-001)
GET    /          → listBooks (US-002)
GET    /search    → searchBooks (US-005)
GET    /:id       → getBook
PUT    /:id       → updateBook (US-003)
DELETE /:id       → deleteBook (US-004)
```

**Customers** (`/api/v1/customers`)
```
POST   /          → addCustomer (US-006)
GET    /          → listCustomers (US-007)
GET    /:id       → getCustomer
PUT    /:id       → updateCustomer
DELETE /:id       → deleteCustomer
```

**Orders** (`/api/v1/orders`)
```
POST   /              → createOrder (US-008)
GET    /              → listOrders (with filters)
GET    /:id           → getOrder
PUT    /:id/status    → updateOrderStatus (US-009)
```

---

## Middleware (Future)

### Authentication Middleware
```typescript
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token
  next();
};
```

### Logging Middleware
```typescript
export const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};
```

### Error Handler Middleware
```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
};
```

---

## Environment Configuration

```bash
# .env
PORT=3000
NODE_ENV=development

# Database (for PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookshop
DB_USER=postgres
DB_PASSWORD=postgres

# Security (future)
JWT_SECRET=your-secret-key
```

---

## Error Handling Strategy

### Custom Error Classes
```typescript
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
```

### Error Response Format
```json
{
  "error": "Error message",
  "details": {
    "field": "Specific error"
  }
}
```

---

## Performance Considerations

### Database Indexing

See [Database Design](../02-database-design/database-design.md) for complete DDL.

### Query Optimization
- Use indexes for searches
- Limit results (pagination)
- Select only needed fields

### Caching Strategy (Future)
- Cache frequently accessed books
- Cache customer data (short TTL)
- Invalidate on updates

---

## Security Measures

### Input Validation
- ✅ All inputs validated with Zod
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (JSON responses)

### Authentication (Future)
- JWT tokens
- Password hashing (bcrypt)
- Role-based access control

### CORS Configuration
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## Testing Strategy

### Unit Tests
- Service layer business logic
- Validation schemas
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Error handling

### E2E Tests
- Complete user workflows
- Transaction scenarios
- Edge cases

---

## Deployment Architecture

### Development
```
Local Machine
├── Node.js (localhost:3000)
├── PostgreSQL (localhost:5432)
└── In-memory DB (quick start)
```

### Production (Future)
```
Cloud Provider (AWS/Azure/GCP)
├── API Server (Container/VM)
├── PostgreSQL (Managed DB)
├── Load Balancer
└── CDN (for static assets)
```

---

## API Documentation

### OpenAPI Specification
All endpoints documented in:
- `context/06-contracts/01-apis/rest/books.yaml`
- `context/06-contracts/01-apis/rest/customers.yaml`
- `context/06-contracts/01-apis/rest/orders.yaml`

### Swagger UI (Future)
```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

---

## Monitoring & Logging (Future)

### Application Logging
- Winston or Pino
- Structured JSON logs
- Log levels (error, warn, info, debug)

### Performance Monitoring
- Response time tracking
- Database query performance
- Error rate monitoring

### Health Checks
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});
```

---

## Migration Path

### Current State (v1.0)
- ✅ In-memory database
- ✅ All 9 user stories implemented
- ✅ Business rules enforced
- ✅ OpenAPI contracts followed

### Next Steps (v1.1)
- 🔄 PostgreSQL integration
- 🔄 Authentication & authorization
- 🔄 Comprehensive testing
- 🔄 API documentation (Swagger)

### Future (v2.0)
- 📅 Caching layer (Redis)
- 📅 Real-time updates (WebSocket)
- 📅 Advanced reporting
- 📅 Audit logging

---

**Architecture Version**: 1.0.0  
**Last Updated**: June 2026  
**Stack**: Node.js + Express + TypeScript  
**Database**: In-memory (PostgreSQL ready)
