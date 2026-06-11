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

### Shopping Cart
- Users must be able to add books to a cart from the Books page (list and grid view)
- Cart data must be stored client-side (localStorage) — no authentication required
- Cart must persist across page refreshes and browser sessions
- Users must be able to view cart items with cover thumbnail, title, author, unit price, and quantity
- Users must be able to adjust item quantities (+/- buttons) directly in the cart
- Users must be able to remove individual items from the cart
- Cart must display a summary: total items count, subtotal per item, grand total
- Sidebar must show a cart icon with a badge indicating the number of items in the cart
- "Add to cart" must show a success toast notification
- Items with insufficient stock must show a warning when added

### Cart Backend (Checkout preparation)
- Backend must provide a `POST /api/v1/cart/validate` endpoint to check stock availability for all cart items
- Backend must provide a `POST /api/v1/cart/checkout` endpoint that converts cart items into an order (placeholder — full payment integration deferred)
- Checkout must validate stock before creating the order (transactional)
- Checkout must reduce stock for each item on successful order creation
- Checkout must record stock movements and audit log entries

### UI Design Polish (Visual Refresh)
- Apply a rich brand gradient (indigo → blue → purple) to sidebar, page headers, and primary buttons to establish a premium "literary bookshop" identity
- Add backdrop blur (`backdrop-blur-sm`) on modal overlays for a modern glassmorphism feel
- Improve sidebar active state with a 3px left-border accent indicator instead of solid background fill
- Add subtle hover lift effect on cards (`scale-[1.01]` + border color transition)
- Polish page title typography with lighter weight and tracking
- Add icon slide animation on button hover
- Replace `animate-pulse` skeleton loaders with a shimmer gradient sweep effect
- Update search input to `rounded-full` pill style
- Add user avatar placeholder section at bottom of sidebar

### Brand Rebrand: Bookshop → BookHouse
- Rename all brand references from "Bookshop" to "BookHouse" across frontend (sidebar, page titles, HTML title, favicon)
- Replace the sidebar logo "B" with a vintage circular badge SVG logo: double-ring border, "BOOK" top / "HOUSE" bottom, center has a book + house icon combination, brand gradient colors (indigo → blue → purple)
- Logo box in sidebar should be slightly larger (`w-10 h-10` instead of `w-8 h-8`) to accommodate the badge detail
- Update `index.html` title from "Bookshop Management System" to "BookHouse — Vintage Bookstore Management"

### Favourites (Wishlist)
- Users can mark books as favourites via a heart icon toggle on book cards/rows
- Favourites stored client-side in localStorage (no auth yet)
- Dedicated Favourites page accessible from sidebar nav
- Favourites page shows all liked books with cover, title, author, price
- Users can select individual books via checkbox and "Add Selected to Cart"
- Sidebar nav item shows heart icon + favourite count badge
- Users can remove individual books via the heart toggle on the Favourites page
- Users can select multiple books and "Remove Selected" from favourites in batch
- Users can "Clear All Favourites" to remove every favourite at once

### Monthly Sales Analytics Panel
- Dashboard must show a monthly sales table with columns: Month, Total Orders, Books Sold, Revenue (BDT), Avg Order Value
- Each row must show the top-selling book title for that month
- A trend arrow (↑/↓) must indicate revenue change vs previous month
- Top summary bar: "This Month: ৳X (↑Y% from last month)" with YTD total
- Clicking a month row must navigate to the filtered orders page for that month
- Backend must provide a `GET /api/v1/analytics/sales-by-month` endpoint returning aggregated monthly sales data
- No new database tables required — aggregation queries on existing `orders` table