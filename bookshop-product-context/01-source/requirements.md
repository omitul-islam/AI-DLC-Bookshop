# 📌 Requirements

## Functional Requirements

### Book Management
- Add new book (with category assignment)
- View all books
- Update book details
- Delete book
- Search books (including by category)

### Category Management
- Add category
- View all categories
- Update category
- Delete category (only if no books assigned)

### Customer Management
- Add customer
- View customers

### Order Management
- Create order
- Update order status (pending → shipped → delivered)
- Reduce stock when order is placed

---

## Non-Functional Requirements

- System should be simple and easy to use
- Data should remain consistent
- Operations should be fast
- Data must persist across server restarts (PostgreSQL)
- In-memory fallback must remain available for development

### Pagination
- List endpoints must return paginated results with configurable page size
- Page metadata (total, totalPages, hasNext, hasPrev) included in response
- Default page size: 20, max: 100
- Search results must also be paginated

### Stock Movement Log
- Every stock change (order deduction, manual restock, adjustment) must be logged
- Log must record: book ID, old stock, new stock, quantity delta, reason, reference ID, timestamp
- Manual stock adjustment endpoint must allow inventory staff to add/remove stock
- Stock history must be viewable per book with pagination

### Audit Log
- Every create/update/delete on books, customers, and orders must be recorded
- Log must capture: entity type, entity ID, action, previous state, new state, performer, timestamp
- Audit log must be append-only and immutable
- Audit log must be filterable by entity type, entity ID, action, and date range

### Book Cover Images
- Books must support a cover image displayed in card view
- Cover images must be uploaded via file upload (not URL paste)
- Uploaded images stored in S3-compatible storage (Supabase Storage via S3 API)
- Allowed formats: JPEG, PNG, WebP, GIF
- Max file size: 5MB
- Books page must have a toggle between list view and grid/card view
- Card view must display the cover image with a placeholder fallback

### Export CSV
- Users must be able to export books, customers, and orders as CSV
- Export must respect current filters (e.g., export only pending orders)
- CSV must include BOM for Excel compatibility
- Exported filename must include the current date