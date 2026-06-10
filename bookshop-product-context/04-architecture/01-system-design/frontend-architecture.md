# Frontend Architecture

## Purpose
Technical architecture and design decisions for the Bookshop Management System frontend application.

---

## Technology Stack

### Core
- **Framework**: React 18.2+
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5.0+
- **Package Manager**: npm

### Routing & Navigation
- **React Router**: v6.20+
- Client-side routing
- Code splitting per route

### HTTP & API
- **Axios**: ^1.6.0
- Interceptors for auth & errors
- Request/response transformation

### Form Management
- **React Hook Form**: ^7.49.0
- **Zod**: ^3.22.0 (validation)
- Integration with validation schemas

### Styling
- **Tailwind CSS**: ^3.4.0
- Utility-first CSS
- Custom design tokens
- Responsive utilities

### Icons
- **Heroicons**: ^2.1.0
- Consistent icon library
- Outline & solid variants

---

## Project Structure

```
bookshop-frontend/
├── public/
│   └── assets/              # Static assets
├── src/
│   ├── api/                 # API client & endpoints
│   │   ├── client.ts        # Axios instance
│   │   ├── books.api.ts
│   │   ├── customers.api.ts
│   │   └── orders.api.ts
│   ├── components/          # Reusable components
│   │   ├── common/          # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── books/           # Book-specific
│   │   │   ├── BookForm.tsx
│   │   │   ├── BookList.tsx
│   │   │   └── BookRow.tsx
│   │   ├── customers/       # Customer-specific
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerList.tsx
│   │   └── orders/          # Order-specific
│   │       ├── OrderForm.tsx
│   │       ├── OrderCard.tsx
│   │       └── OrderFilters.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useBooks.ts
│   │   ├── useCustomers.ts
│   │   ├── useOrders.ts
│   │   └── useToast.ts
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   ├── pages/               # Page components
│   │   ├── BooksPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── HomePage.tsx
│   ├── types/               # TypeScript types
│   │   ├── book.types.ts
│   │   ├── customer.types.ts
│   │   ├── order.types.ts
│   │   └── api.types.ts
│   ├── utils/               # Utility functions
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── context/             # React Context (minimal)
│   │   └── ToastContext.tsx
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Component Hierarchy

```
App
└── BrowserRouter
    └── MainLayout
        ├── Sidebar
        │   ├── Logo
        │   └── Navigation
        │       ├── BooksLink
        │       ├── CustomersLink
        │       └── OrdersLink
        └── MainContent
            └── Routes
                ├── / → HomePage
                ├── /books → BooksPage
                │   ├── PageHeader
                │   ├── SearchBar
                │   ├── BookList
                │   │   └── BookRow[]
                │   ├── BookFormModal
                │   └── ConfirmDialog
                ├── /customers → CustomersPage
                │   ├── PageHeader
                │   ├── SearchBar
                │   ├── CustomerList
                │   └── CustomerFormModal
                └── /orders → OrdersPage
                    ├── PageHeader
                    ├── OrderFilters
                    ├── OrderList
                    │   └── OrderCard[]
                    └── CreateOrderModal
```

---

## State Management Strategy

### Local Component State
Use `useState` for:
- UI state (modals open/closed, form inputs)
- Component-specific data
- Temporary state

### Custom Hooks for Data Fetching
```typescript
// useBooks.ts
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await booksApi.getAll();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { books, loading, error, fetchBooks };
}
```

### Global State (Minimal)
Use Context only for:
- Toast notifications
- User session (future)
- Theme preferences (future)

**No Redux** - Not needed for this scale

---

## API Integration Pattern

### API Client Setup
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add auth token if available
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Centralized error handling
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Service Pattern
```typescript
// api/books.api.ts
import apiClient from './client';
import { Book, CreateBookRequest } from '../types/book.types';

export const booksApi = {
  getAll: () => apiClient.get<Book[]>('/books'),
  
  search: (query: string) => 
    apiClient.get<Book[]>(`/books/search?q=${query}`),
  
  getById: (id: string) => 
    apiClient.get<Book>(`/books/${id}`),
  
  create: (data: CreateBookRequest) => 
    apiClient.post<Book>('/books', data),
  
  update: (id: string, data: Partial<CreateBookRequest>) => 
    apiClient.put<Book>(`/books/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/books/${id}`),
};
```

---

## Form Handling Pattern

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema (matches backend)
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  price: z.number().min(0, 'Price must be 0 or greater'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
});

function BookForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Title"
        {...register('title')}
        error={errors.title?.message}
      />
      {/* ... */}
      <Button type="submit" disabled={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

---

## Error Handling Strategy

### Levels of Error Handling

1. **API Interceptor** (global)
   - Network errors
   - Auth errors (401)
   - Server errors (500)

2. **Component Level** (specific)
   - Validation errors (400)
   - Not found errors (404)
   - Business logic errors

3. **User Feedback**
   - Toast notifications for success/error
   - Inline error messages for forms
   - Error boundaries for crashes

### Error Display Pattern
```typescript
try {
  await booksApi.create(data);
  showToast({ type: 'success', message: 'Book added successfully' });
  onClose();
} catch (error) {
  if (error.response?.status === 400) {
    // Validation errors - show inline
    setFormErrors(error.response.data.details);
  } else {
    // Other errors - show toast
    showToast({ 
      type: 'error', 
      message: error.message || 'Failed to add book' 
    });
  }
}
```

---

## Performance Optimizations

### Code Splitting
```typescript
// Lazy load pages
const BooksPage = lazy(() => import('./pages/BooksPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
```

### Debouncing Search
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    booksApi.search(query).then(setBooks);
  }, 300),
  []
);
```

### Memoization
```typescript
const filteredOrders = useMemo(
  () => orders.filter(o => o.status === selectedStatus),
  [orders, selectedStatus]
);
```

---

## Routing Structure

```typescript
<Routes>
  <Route path="/" element={<MainLayout />}>
    <Route index element={<HomePage />} />
    <Route path="books" element={<BooksPage />} />
    <Route path="customers" element={<CustomersPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

---

## Environment Configuration

```typescript
// .env.development
VITE_API_URL=http://localhost:3000/api/v1

// .env.production
VITE_API_URL=https://api.bookshop.com/api/v1
```

---

## Build & Deployment

### Development
```bash
npm run dev      # Vite dev server on port 5173
```

### Production
```bash
npm run build    # Build to dist/
npm run preview  # Preview production build
```

### Output
- Optimized bundle
- Code splitting
- Asset optimization
- Source maps (dev only)

---

## Testing Strategy (Future)

### Unit Tests
- Component testing with React Testing Library
- Hook testing
- Utility function testing

### Integration Tests
- API integration tests
- Form submission flows
- Navigation flows

### E2E Tests
- Critical user journeys
- Complete workflows

---

## Security Considerations

### Input Sanitization
- All user inputs validated
- XSS prevention (React default)
- SQL injection prevented (API layer)

### API Security
- CORS properly configured
- Auth tokens (future)
- HTTPS only in production

---

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios met
- Focus indicators

---

**Architecture Version**: 1.0.0  
**Last Updated**: June 2026  
**Framework**: React 18 + TypeScript + Vite
