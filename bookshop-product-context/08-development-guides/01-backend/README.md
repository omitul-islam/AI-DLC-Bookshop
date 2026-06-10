# Backend Development Guide

## Purpose
Comprehensive guide for implementing the Bookshop Management System backend.

---

## Getting Started

### Prerequisites
- Node.js 18+ or Python 3.11+
- Database (PostgreSQL recommended)
- Git
- Code editor (VS Code recommended)

### Project Setup

```bash
# Clone implementation repo
git clone <backend-repo-url>
cd bookshop-backend

# Add product context as submodule
git submodule add <context-repo-url> context
git submodule update --init --recursive

# Install dependencies
npm install  # or pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate  # or python manage.py migrate

# Start development server
npm run dev  # or python manage.py runserver
```

---

## Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────┐
│         API Layer (REST)            │  ← Express/FastAPI
├─────────────────────────────────────┤
│       Service Layer (Business)      │  ← Business logic
├─────────────────────────────────────┤
│       Repository Layer (Data)       │  ← Data access
├─────────────────────────────────────┤
│         Database (PostgreSQL)       │  ← Persistence
└─────────────────────────────────────┘
```

---

## Technology Stack

### Recommended Stack (Node.js)
- **Framework**: Express.js or NestJS
- **ORM**: Prisma or TypeORM
- **Validation**: Joi or Zod
- **Testing**: Jest
- **Database**: PostgreSQL

### Alternative Stack (Python)
- **Framework**: FastAPI or Django REST
- **ORM**: SQLAlchemy or Django ORM
- **Validation**: Pydantic
- **Testing**: Pytest
- **Database**: PostgreSQL

---

## Project Structure

```
bookshop-backend/
├── context/              # Git submodule (product context)
├── src/
│   ├── api/              # API endpoints/controllers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── models/           # Domain entities
│   ├── middleware/       # Express middleware
│   ├── validators/       # Input validation
│   └── utils/            # Utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── migrations/           # Database migrations
└── config/               # Configuration
```

---

## Implementation Guidelines

### 1. Using Contracts from Context

```typescript
// Import API contract types
import { BookDTO, CreateBookRequest } from '../context/06-contracts/01-apis/rest/books.yaml';

// Generate TypeScript types from OpenAPI
// Use: openapi-typescript or swagger-typescript-api

// Example service
class BookService {
  async addBook(request: CreateBookRequest): Promise<BookDTO> {
    // Implementation follows contract
  }
}
```

### 2. Business Rules Implementation

```typescript
// Reference business rules from context
// See: context/02-domain/03-business-rules/book-rules.md

class BookValidator {
  validatePrice(price: number): void {
    if (price < 0) {
      throw new ValidationError('BR-BOOK-002: Price must be zero or greater');
    }
  }
  
  validateStock(stock: number): void {
    if (stock < 0 || !Number.isInteger(stock)) {
      throw new ValidationError('BR-BOOK-003: Stock must be non-negative integer');
    }
  }
}
```

### 3. Repository Pattern

```typescript
interface BookRepository {
  create(data: CreateBookRequest): Promise<Book>;
  findAll(): Promise<Book[]>;
  findById(id: string): Promise<Book | null>;
  update(id: string, data: Partial<Book>): Promise<Book>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Book[]>;
}

class BookRepositoryImpl implements BookRepository {
  // Implementation using ORM
}
```

---

## API Implementation

### Endpoint Structure

```typescript
// routes/books.ts
import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { validateRequest } from '../middleware/validation';

const router = Router();
const controller = new BookController();

// POST /api/v1/books
router.post('/books', 
  validateRequest(CreateBookSchema), 
  controller.addBook
);

// GET /api/v1/books
router.get('/books', controller.listBooks);

// GET /api/v1/books/:id
router.get('/books/:id', controller.getBook);

// PUT /api/v1/books/:id
router.put('/books/:id', 
  validateRequest(UpdateBookSchema), 
  controller.updateBook
);

// DELETE /api/v1/books/:id
router.delete('/books/:id', controller.deleteBook);

// GET /api/v1/books/search?q=query
router.get('/books/search', controller.searchBooks);

export default router;
```

---

## Database Schema

### Book Table

```sql
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
CREATE INDEX idx_books_created_at ON books(created_at DESC);
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: string;
  details?: Record<string, string>;
  code?: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
if (price < 0) {
  throw new ApiError(400, 'Validation failed', {
    price: 'Price must be zero or greater'
  });
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('BookService', () => {
  describe('addBook', () => {
    it('should create book with valid data', async () => {
      const request: CreateBookRequest = {
        title: 'Test Book',
        author: 'Test Author',
        price: 10.99,
        stock: 5
      };
      
      const result = await bookService.addBook(request);
      
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test Book');
    });
    
    it('should reject negative price', async () => {
      const request = { /* ... */ price: -5 };
      
      await expect(bookService.addBook(request))
        .rejects.toThrow('Price must be zero or greater');
    });
  });
});
```

### Integration Tests

```typescript
describe('Book API', () => {
  it('POST /api/v1/books should create book', async () => {
    const response = await request(app)
      .post('/api/v1/books')
      .send({
        title: 'Test Book',
        author: 'Test Author',
        price: 10.99,
        stock: 5
      });
      
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

## Environment Configuration

### .env Example

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bookshop

# API
PORT=3000
API_VERSION=v1

# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=debug
```

---

## Development Workflow

1. **Read Context**: Review user story and business rules in `context/`
2. **Check Contract**: Review API contract in `context/06-contracts/`
3. **Write Tests**: Start with tests (TDD)
4. **Implement**: Write code to pass tests
5. **Validate**: Ensure business rules enforced
6. **Review**: Code review with team
7. **Deploy**: Deploy to dev environment

---

## Related Guides

- [Testing Guide](../03-testing/testing-guide.md)
- [API Design Guide](./api-design.md)
- [Database Guide](./database-guide.md)
- [Deployment Guide](./deployment-guide.md)

---

**Last Updated**: June 2026
