# Book Management Module

## Module Overview

### Purpose
Manages the complete lifecycle of books in the inventory including creation, retrieval, updates, deletion, and search functionality.

### Scope
- Book CRUD operations
- Inventory tracking
- Search and filtering
- Stock management integration

---

## Domain Entities

### Book Entity

```yaml
Book:
  id: UUID
  title: string (required)
  author: string (required)
  price: decimal (required, >= 0)
  stock: integer (required, >= 0)
  createdAt: timestamp
  updatedAt: timestamp
```

### Attributes

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | UUID | Auto | - | Unique identifier |
| title | String | Yes | Non-empty | Book title |
| author | String | Yes | Non-empty | Author name(s) |
| price | Decimal | Yes | >= 0 | Selling price |
| stock | Integer | Yes | >= 0 | Available quantity |
| createdAt | Timestamp | Auto | - | Creation time |
| updatedAt | Timestamp | Auto | - | Last update time |

---

## Business Operations

### 1. Add Book

**Operation**: `addBook(CreateBookDTO) → BookDTO`

**Input**:
```typescript
{
  title: string;
  author: string;
  price: number;
  stock: number;
}
```

**Business Logic**:
1. Validate required fields present
2. Validate price >= 0
3. Validate stock >= 0 and integer
4. Generate unique ID
5. Set createdAt timestamp
6. Save to database
7. Return created book

**Output**: BookDTO with generated ID

**Business Rules**: BR-BOOK-001, BR-BOOK-002, BR-BOOK-003

---

### 2. List Books

**Operation**: `listBooks() → BookDTO[]`

**Input**: None

**Business Logic**:
1. Fetch all books from database
2. Order by createdAt DESC (newest first)
3. Return list

**Output**: Array of BookDTO

**Business Rules**: None

---

### 3. Get Book by ID

**Operation**: `getBook(id: UUID) → BookDTO`

**Input**: Book ID

**Business Logic**:
1. Fetch book by ID
2. If not found, throw NotFoundError
3. Return book

**Output**: BookDTO

**Errors**: 404 if book not found

---

### 4. Update Book

**Operation**: `updateBook(id: UUID, UpdateBookDTO) → BookDTO`

**Input**:
```typescript
{
  title?: string;
  author?: string;
  price?: number;
  stock?: number;
}
```

**Business Logic**:
1. Fetch existing book by ID
2. If not found, throw NotFoundError
3. Merge provided fields with existing
4. Validate price >= 0 (if provided)
5. Validate stock >= 0 (if provided)
6. Update updatedAt timestamp
7. Save changes
8. Return updated book

**Output**: Updated BookDTO

**Business Rules**: BR-BOOK-002, BR-BOOK-003, BR-BOOK-004

---

### 5. Delete Book

**Operation**: `deleteBook(id: UUID) → void`

**Input**: Book ID

**Business Logic**:
1. Fetch book by ID
2. If not found, throw NotFoundError
3. Delete book record
4. Return success

**Output**: Success confirmation

**Business Rules**: BR-BOOK-005

**Note**: Consider soft delete in future for audit trail

---

### 6. Search Books

**Operation**: `searchBooks(query: string) → BookDTO[]`

**Input**: Search query string

**Business Logic**:
1. Validate query is non-empty
2. Search by title OR author (case-insensitive)
3. Use partial matching (LIKE/contains)
4. Return matching books

**Output**: Array of matching BookDTO

**Search Algorithm**:
```sql
WHERE LOWER(title) LIKE '%query%' 
   OR LOWER(author) LIKE '%query%'
```

**Business Rules**: BR-BOOK-006, BR-BOOK-007

---

## Data Model

### Database Schema

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

-- Indexes for performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
```

---

## API Endpoints

### REST API

| Method | Endpoint | Operation | Request | Response |
|--------|----------|-----------|---------|----------|
| POST | /api/v1/books | Create book | CreateBookDTO | BookDTO (201) |
| GET | /api/v1/books | List all books | - | BookDTO[] (200) |
| GET | /api/v1/books/:id | Get book | - | BookDTO (200) |
| PUT | /api/v1/books/:id | Update book | UpdateBookDTO | BookDTO (200) |
| DELETE | /api/v1/books/:id | Delete book | - | Success (204) |
| GET | /api/v1/books/search?q={query} | Search books | query param | BookDTO[] (200) |

---

## Integration Points

### Consumes
- None (foundation module)

### Provides
- Book availability for Order Management
- Book details for reporting
- Stock levels for inventory tracking

### Events Published

```yaml
BookCreated:
  payload:
    bookId: UUID
    title: string
    author: string
    price: number
    stock: number
    
BookUpdated:
  payload:
    bookId: UUID
    changes: object
    
BookDeleted:
  payload:
    bookId: UUID
    
StockUpdated:
  payload:
    bookId: UUID
    oldStock: number
    newStock: number
    reason: string
```

---

## Business Rules Summary

| Rule ID | Description | Severity |
|---------|-------------|----------|
| BR-BOOK-001 | Required fields | Critical |
| BR-BOOK-002 | Price >= 0 | Critical |
| BR-BOOK-003 | Stock >= 0 | Critical |
| BR-BOOK-004 | Update validation | Important |
| BR-BOOK-005 | Delete validation | Important |
| BR-BOOK-006 | Search query validation | Important |
| BR-BOOK-007 | Search matching logic | Important |

---

## Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| BOOK_NOT_FOUND | 404 | Book with given ID not found |
| INVALID_PRICE | 400 | Price is negative |
| INVALID_STOCK | 400 | Stock is negative or non-integer |
| MISSING_FIELDS | 400 | Required fields not provided |
| INVALID_SEARCH | 400 | Search query is empty |

---

## Performance Considerations

### Indexing Strategy
- Index on `title` for search performance
- Index on `author` for search performance
- Index on `created_at` for listing performance

### Caching Strategy (Future)
- Cache frequently accessed books
- Invalidate cache on updates
- TTL: 5 minutes

### Pagination (Future)
- Implement for `listBooks` when inventory grows
- Default page size: 50 books
- Support filtering and sorting

---

## Security Considerations

### Authentication
- All endpoints require authentication
- Role-based access control

### Authorization
- CREATE: Manager, Owner roles
- READ: All authenticated users
- UPDATE: Manager, Owner roles
- DELETE: Owner role only

### Input Validation
- Sanitize all string inputs
- Validate numeric ranges
- Prevent SQL injection via parameterized queries

---

## Testing Strategy

### Unit Tests
- Validation logic
- Business rules enforcement
- Error handling

### Integration Tests
- Database operations
- API endpoints
- Search functionality

### Test Cases
1. Create book with valid data → Success
2. Create book with missing fields → Error
3. Create book with negative price → Error
4. Update book price → Success
5. Delete existing book → Success
6. Delete non-existent book → Error
7. Search books by title → Results
8. Search books by author → Results
9. Search with empty query → Error

---

## Future Enhancements

### Phase 2
- Book categories/genres
- ISBN tracking
- Publisher information
- Book cover images
- Multiple authors support

### Phase 3
- Advanced search (by genre, price range, date)
- Book reviews and ratings
- Related books recommendations
- Bulk import/export
- Book bundles/series

---

## Related Documents

- [Book Business Rules](../../02-domain/03-business-rules/book-rules.md)
- [Book API Contract](../../06-contracts/01-apis/rest/books.yaml)
- [Order Module](../04-order-management/order-management.md)

---

**Module Owner**: Backend Team  
**Status**: Active Development  
**Last Updated**: June 2026
