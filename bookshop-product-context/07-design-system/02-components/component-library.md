# Component Library

## Purpose
Reusable UI component specifications for consistent design across the application.

---

## Layout Components

### Sidebar Navigation
```tsx
<Sidebar>
  - Logo
  - Navigation Links
    - Books
    - Customers
    - Orders
  - User Info (bottom)
</Sidebar>
```

**Specifications:**
- Fixed width: 250px
- Dark background
- Icons + labels for navigation items
- Active state highlighting

### Page Header
```tsx
<PageHeader
  title="Books"
  action={<Button>Add Book</Button>}
/>
```

**Specifications:**
- Title (2xl font)
- Optional action button (right-aligned)
- Bottom border

---

## Data Display Components

### Table
```tsx
<Table
  columns={[
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'actions', label: 'Actions' }
  ]}
  data={books}
  onRowClick={(book) => handleEdit(book)}
/>
```

**Specifications:**
- Striped rows
- Hover effect
- Sortable columns (future)
- Action buttons in last column

### Card
```tsx
<Card
  title="Order #123"
  subtitle="Created: 2026-06-05"
>
  {children}
</Card>
```

**Specifications:**
- White background
- Shadow
- Rounded corners
- Optional title and subtitle

### Status Badge
```tsx
<StatusBadge status="pending" />
<StatusBadge status="shipped" />
<StatusBadge status="delivered" />
```

**Specifications:**
- Color-coded by status
- Rounded pill shape
- Icon + text
- Small size

---

## Form Components

### Input Field
```tsx
<Input
  label="Book Title"
  name="title"
  placeholder="Enter book title"
  error="Title is required"
  required
/>
```

**Specifications:**
- Label above input
- Red border on error
- Error message below input
- Required asterisk

### Select Dropdown
```tsx
<Select
  label="Customer"
  options={customers}
  value={selectedCustomer}
  onChange={handleChange}
/>
```

**Specifications:**
- Searchable (for long lists)
- Placeholder text
- Disabled state support

### Search Input
```tsx
<SearchInput
  placeholder="Search books..."
  value={searchQuery}
  onChange={handleSearch}
  onClear={handleClear}
/>
```

**Specifications:**
- Magnifying glass icon (left)
- Clear button (right, when value exists)
- Debounced onChange (300ms)

---

## Button Components

### Primary Button
```tsx
<Button variant="primary" onClick={handleClick}>
  Add Book
</Button>
```

**Variants:**
- `primary` - Blue background
- `secondary` - White with border
- `danger` - Red background
- `ghost` - Transparent

**Sizes:**
- `sm` - Small padding
- `md` - Default
- `lg` - Large padding

### Icon Button
```tsx
<IconButton icon={<PencilIcon />} onClick={handleEdit} />
```

**Specifications:**
- Square shape
- Hover effect
- Tooltip on hover

---

## Modal Components

### Dialog Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Add Book"
  size="md"
>
  {children}
</Modal>
```

**Sizes:**
- `sm` - 400px
- `md` - 600px
- `lg` - 800px

**Features:**
- Backdrop overlay
- Close on backdrop click
- ESC key to close
- Centered on screen

### Confirmation Dialog
```tsx
<ConfirmDialog
  isOpen={isOpen}
  title="Delete Book?"
  message="Are you sure you want to delete this book? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  variant="danger"
/>
```

**Specifications:**
- Warning icon for danger variant
- Cancel button (secondary)
- Confirm button (matches variant)

---

## Feedback Components

### Alert
```tsx
<Alert variant="success" title="Success!" message="Book added successfully" />
<Alert variant="error" title="Error" message="Failed to add book" />
```

**Variants:**
- `success` - Green
- `error` - Red
- `warning` - Yellow
- `info` - Blue

### Toast Notification
```tsx
showToast({
  type: 'success',
  message: 'Book added successfully',
  duration: 3000
})
```

**Specifications:**
- Auto-dismiss after duration
- Positioned top-right
- Slide-in animation
- Stack multiple toasts

### Loading Spinner
```tsx
<Spinner size="md" />
```

**Sizes:**
- `sm` - 16px
- `md` - 24px
- `lg` - 32px

---

## Specialized Components

### Book List Item
```tsx
<BookListItem
  book={book}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Display:**
- Title (bold)
- Author (gray)
- Price (right-aligned)
- Stock badge
- Action buttons

### Customer Card
```tsx
<CustomerCard
  customer={customer}
  showOrders={true}
/>
```

**Display:**
- Name
- Email
- Phone
- Total orders (if enabled)

### Order Summary
```tsx
<OrderSummary
  order={order}
  showActions={true}
/>
```

**Display:**
- Order ID
- Customer name
- Book title
- Quantity
- Total price
- Status badge
- Action buttons (if enabled)

---

## Empty States

### Empty List
```tsx
<EmptyState
  icon={<BookIcon />}
  title="No books found"
  message="Add your first book to get started"
  action={<Button>Add Book</Button>}
/>
```

### No Results
```tsx
<EmptyState
  icon={<SearchIcon />}
  title="No results found"
  message="Try adjusting your search query"
/>
```

---

## Component Usage Guidelines

### When to Use Cards
- Grouping related information
- Dashboard widgets
- Individual items in a grid

### When to Use Tables
- Large datasets
- Multiple columns of data
- Sortable/filterable lists

### When to Use Modals
- Add/Edit forms
- Confirmations
- Detail views

### When to Use Inline Forms
- Quick edits
- Simple inputs
- Search bars

---

## Accessibility Requirements

### All Components Must:
- ✅ Support keyboard navigation
- ✅ Have proper ARIA labels
- ✅ Maintain focus management
- ✅ Provide visual feedback
- ✅ Meet contrast ratios

### Focus Order
1. Navigation
2. Page actions
3. Form inputs (top to bottom)
4. Table rows
5. Action buttons

---

**Last Updated**: June 2026  
**Component Library Version**: 1.0.0
