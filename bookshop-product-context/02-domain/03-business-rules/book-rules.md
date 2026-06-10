# Book Management Business Rules

## Purpose
Validation rules and business logic for book management operations.

---

## BR-BOOK-001: Required Fields

**Rule**: All books must have title, author, price, and stock

**Validation**:
- `title`: non-empty string
- `author`: non-empty string
- `price`: non-negative number
- `stock`: non-negative integer

**Error**: "Missing required fields" (400 Bad Request)

---

## BR-BOOK-002: Price Validation

**Rule**: Book price must be zero or positive

**Validation**:
```
price >= 0
```

**Error**: "Price must be zero or greater" (400 Bad Request)

**Examples**:
- ✅ Valid: 0, 10.99, 25.50
- ❌ Invalid: -5, -0.01

---

## BR-BOOK-003: Stock Validation

**Rule**: Stock quantity must be zero or positive integer

**Validation**:
```
stock >= 0 AND stock is integer
```

**Error**: "Stock must be zero or greater and whole number" (400 Bad Request)

**Examples**:
- ✅ Valid: 0, 1, 100
- ❌ Invalid: -1, 2.5, -10

---

## BR-BOOK-004: Update Validation

**Rule**: When updating a book, only provided fields are changed

**Logic**:
1. Fetch existing book
2. Merge provided fields with existing values
3. Validate merged result
4. Save updates

**Error**: 
- "Book not found" (404 Not Found)
- Field-specific validation errors (400 Bad Request)

---

## BR-BOOK-005: Delete Validation

**Rule**: Book must exist before deletion

**Logic**:
1. Check if book exists
2. If not found, return error
3. If found, delete record

**Error**: "Book not found" (404 Not Found)

**Note**: Consider soft delete for audit trail in future phases

---

## BR-BOOK-006: Search Query Validation

**Rule**: Search query must be non-empty

**Validation**:
```
query.trim().length > 0
```

**Error**: "Search query cannot be empty" (400 Bad Request)

---

## BR-BOOK-007: Search Matching

**Rule**: Search matches title OR author (case-insensitive, partial match)

**Logic**:
```
LOWER(book.title) LIKE '%' + LOWER(query) + '%'
OR
LOWER(book.author) LIKE '%' + LOWER(query) + '%'
```

**Examples**:
- Query "harry" matches "Harry Potter and the..."
- Query "rowling" matches books by "J.K. Rowling"
- Query "potter" matches title and author containing "potter"

---

## BR-BOOK-008: Duplicate Book Handling

**Rule** (Future): Allow duplicate titles if different editions/authors

**Current Behavior**: No duplicate checking (allow all)

**Future Enhancement**: 
- Check title + author + edition
- Warn user if similar book exists
- Allow override

---

## BR-BOOK-009: Book-Order Relationship

**Rule**: Books with active orders should not be deleted

**Current Behavior**: No constraint (allow deletion)

**Future Enhancement**:
- Check for active orders before deletion
- Offer "archive" instead of delete
- Maintain referential integrity

---

## Validation Priority

1. **Required fields** (BR-BOOK-001)
2. **Data type validation** (price, stock)
3. **Business rules** (positive price, non-negative stock)
4. **Existence checks** (for update/delete)
5. **Search validation** (BR-BOOK-006)

---

## Error Handling

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": {
    "price": "Price must be zero or greater",
    "stock": "Stock must be a whole number"
  }
}
```

### Not Found (404)
```json
{
  "error": "Book not found",
  "bookId": "abc-123"
}
```

---

**Related Documents**:
- [Order Rules](./order-rules.md) - Stock validation for orders
- [Module Spec](../../05-modules/02-book-management/book-management.md)

**Last Updated**: June 2026
