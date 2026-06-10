# Bookshop Frontend Design System

> Design context derived from `bookshop-product-context/07-design-system/`

---

## 1. Design Philosophy

Clean, professional, accessible business application focused on inventory management.
Every component follows utility-first Tailwind patterns with consistent spacing,
typography, and color tokens.

---

## 2. Color Palette

### Brand Colors
| Token        | Value     | Usage                    |
|-------------|-----------|--------------------------|
| `primary`   | `#3B82F6` | Buttons, links, active   |
| `primary-dark` | `#2563EB` | Hover states           |
| `primary-light` | `#DBEAFE` | Backgrounds, badges    |

### Status Colors
| Token      | Value     | Usage                          |
|-----------|-----------|--------------------------------|
| `success` | `#10B981` | Success toasts, delivered badge |
| `warning` | `#F59E0B` | Warnings, pending badge         |
| `error`   | `#EF4444` | Errors, validation, danger btn  |

### Neutral Scale
| Token     | Value     | Usage               |
|-----------|-----------|----------------------|
| `gray-50` | `#F9FAFB` | Page background     |
| `gray-100`| `#F3F4F6` | Card backgrounds    |
| `gray-200`| `#E5E7EB` | Borders             |
| `gray-500`| `#6B7280` | Secondary text      |
| `gray-900`| `#111827` | Primary text        |

---

## 3. Typography

- **Primary font**: `Inter, system-ui, sans-serif` — loaded from Google Fonts
- **Monospace**: `ui-monospace, SFMono-Regular` — for IDs, codes
- **Scale**: xs(12) → sm(14) → base(16) → lg(18) → xl(20) → 2xl(24) → 3xl(30)
- **Weights**: normal(400), medium(500), semibold(600), bold(700)

---

## 4. Spacing & Layout

- **Base unit**: 4px (0.25rem)
- **Sidebar**: 250px fixed width, dark bg (gray-900), white text
- **Main content**: max-w-6xl (72rem), 2rem padding, gray-50 bg
- **Cards**: white bg, `rounded-lg` (8px), `shadow-sm`, p-6

---

## 5. Component Architecture

```
src/
├── components/common/    # Reusable primitives
│   ├── Button.tsx        # primary/secondary/danger/ghost variants
│   ├── Input.tsx         # Labeled input with error state
│   ├── Modal.tsx         # Dialog with backdrop, ESC close
│   ├── Table.tsx         # Generic data table with columns
│   ├── StatusBadge.tsx   # Color-coded order status pill
│   ├── Spinner.tsx       # Loading spinner (sm/md/lg)
│   ├── ConfirmDialog.tsx # Confirmation modal
│   └── EmptyState.tsx    # Empty/no-results placeholder
├── context/
│   └── ToastContext.tsx  # Toast notification system
├── layouts/
│   ├── MainLayout.tsx    # Sidebar + Outlet
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── PageHeader.tsx    # Page title + action
└── pages/
    ├── HomePage.tsx      # Dashboard with module cards
    ├── BooksPage.tsx     # Book CRUD (US-010)
    ├── CustomersPage.tsx # Customer management (US-011)
    └── OrdersPage.tsx    # Order management (US-012)
```

---

## 6. Component Specifications

### Button (`Button.tsx`)
- **Variants**: `primary` (blue bg), `secondary` (white + border), `danger` (red bg), `ghost` (transparent)
- **Sizes**: `sm` (px-3 py-1.5), `md` (px-4 py-2), `lg` (px-6 py-3)
- **States**: loading spinner, disabled opacity, hover transitions
- **Radius**: `rounded-md` (6px)

### Input (`Input.tsx`)
- Label above input with required asterisk
- Red border + error message below on validation error
- Focus ring: `ring-2 ring-primary`
- Padding: `px-3 py-2`

### Modal (`Modal.tsx`)
- Centered dialog with backdrop overlay
- Sizes: `sm` (max-w-sm), `md` (max-w-lg), `lg` (max-w-2xl)
- Close on backdrop click, ESC key
- Slide-up animation on open

### Table (`Table.tsx`)
- Striped rows (`bg-white` / `bg-gray-50`)
- Hover highlight on rows
- Sortable columns (planned)
- Responsive overflow-x-auto

### StatusBadge (`StatusBadge.tsx`)
- Pending: amber bg, clock icon
- Shipped: blue bg, truck icon
- Delivered: green bg, check icon
- Rounded-full pill shape

### Toast (`ToastContext.tsx`)
- Top-right fixed position
- Auto-dismiss after 3 seconds
- Slide-in from right animation
- Stack multiple toasts
- Color-coded: green (success), red (error), blue (info)

### EmptyState (`EmptyState.tsx`)
- Centered icon + title + description
- Optional action button
- Used when list is empty or search has no results

---

## 7. Icon Usage

Using **@heroicons/react** (outline variant for UI, solid for emphasis):

| Context    | Icon              |
|-----------|-------------------|
| Books nav  | BookOpenIcon      |
| Customers  | UserGroupIcon     |
| Orders     | ShoppingCartIcon  |
| Add        | PlusIcon          |
| Search     | MagnifyingGlassIcon |
| Edit       | PencilIcon        |
| Delete     | TrashIcon         |
| Close      | XMarkIcon         |
| Pending    | ClockIcon         |
| Shipped    | TruckIcon         |
| Delivered  | CheckCircleIcon   |
| Success    | CheckCircleIcon   |
| Error      | ExclamationCircleIcon |
| Warning    | ExclamationTriangleIcon |

---

## 8. Animation & Transitions

- **Duration**: 150ms (fast), 300ms (standard)
- **Easing**: `ease-in-out`
- **Toasts**: slide-in from right
- **Modal**: scale + fade in
- **Buttons**: background color transition
- **Sidebar links**: background color transition
- **Table rows**: background highlight transition

---

## 9. Responsive Breakpoints

| Breakpoint | Width  |
|-----------|--------|
| sm        | 640px  |
| md        | 768px  |
| lg        | 1024px |
| xl        | 1280px |

On mobile (<1024px): sidebar collapses, tables become scrollable.

---

## 10. Accessibility Standards

- WCAG 2.1 Level AA compliance
- Visible focus rings on all interactive elements (`ring-2 ring-primary`)
- Proper ARIA labels on icon buttons, badges
- Form fields have associated labels
- Color contrast ratios met for all text
- Keyboard navigation: Tab through form fields, Enter to submit, Esc to close modals
- Status badges include `aria-label` for screen readers

---

## 11. References

- `bookshop-product-context/07-design-system/01-foundation/ui-specifications.md`
- `bookshop-product-context/07-design-system/02-components/component-library.md`
- `bookshop-product-context/04-architecture/01-system-design/frontend-architecture.md`

---

*Design System Version: 2.0.0 — Last Updated: June 2026*
