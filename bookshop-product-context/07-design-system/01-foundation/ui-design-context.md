# UI Design Context — Bookshop Management System

**Version**: 2.0.0 | **Last Updated**: June 2026
**Purpose**: Single-source-of-truth reference for all UI design decisions. Every component, spacing rule, color token, and layout constraint is defined here for consistent AI-generated and hand-written code.

---

## 1. Design Philosophy

Clean, professional, accessible business application focused on inventory management (Books, Customers, Orders). Utility-first Tailwind CSS patterns with no custom CSS unless necessary. Every pixel is intentional — no magic numbers.

---

## 2. Technology Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18+ with TypeScript |
| Routing | React Router v6 (NavLink, Outlet) |
| Styling | Tailwind CSS 3.x (utility-first, no CSS modules) |
| Icons | @heroicons/react v2 (outline variant by default) |
| Build | Vite |
| Font | Inter (Google Fonts), system-ui fallback |

---

## 3. Tailwind Configuration

Defined in `tailwind.config.js`:

```js
colors: {
  primary: { DEFAULT: '#3B82F6', dark: '#2563EB', light: '#DBEAFE' },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['Courier New', 'Courier', 'ui-monospace', 'monospace'],
}
boxShadow: {
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}
```

Global CSS layer (`index.css`):
- Body: `bg-gray-50 text-gray-900 antialiased`, font-family Inter
- Global focus-visible ring: `ring-2 ring-primary ring-offset-1`
- Custom slim scrollbar (`w-1.5`)
- `.card`: `bg-white rounded-lg shadow-card p-6`
- `.card-hover`: adds `hover:shadow-card-hover`

---

## 4. Color Palette

### Primary Brand
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| primary | `#3B82F6` | `bg-blue-600` / `text-blue-600` / `ring-primary` | Buttons, links, active nav, info badges |
| primary-dark | `#2563EB` | `hover:bg-blue-700` | Hover on primary buttons |
| primary-light | `#DBEAFE` | `bg-blue-100` / `text-blue-700` | Badge backgrounds, highlight containers |

### Status
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| success | `#10B981` | `bg-green-100 text-green-700` | Delivered badge, success toasts |
| warning | `#F59E0B` | `bg-amber-100 text-amber-700` | Pending badge, caution alerts |
| error | `#EF4444` | `bg-red-500 bg-red-100 text-red-700` | Delete buttons, error toasts, validation |
| info | `#3B82F6` | `bg-blue-100 text-blue-700` | Shipped badge, informational |

### Neutrals
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| gray-50 | `#F9FAFB` | `bg-gray-50` | Page background, table header |
| gray-100 | `#F3F4F6` | `bg-gray-100` | Card backgrounds (alt), empty state icon bg |
| gray-200 | `#E5E7EB` | `border-gray-200 divide-gray-200` | Borders, dividers, table grid |
| gray-300 | `#D1D5DB` | `border-gray-300` | Input borders (default) |
| gray-400 | `#9CA3AF` | `text-gray-400` | Icon color (inactive), placeholder text |
| gray-500 | `#6B7280` | `text-gray-500` | Secondary/meta text, table header text |
| gray-700 | `#374151` | `text-gray-700` | Body text, labels |
| gray-800 | `#1F2937` | `bg-gray-800 hover:bg-gray-800` | Sidebar hover, sidebar dividers |
| gray-900 | `#111827` | `bg-gray-900 text-gray-900` | Sidebar background, page titles |

---

## 5. Typography

| Role | Tailwind | Size | Weight | Color |
|------|----------|------|--------|-------|
| Page title | `text-3xl font-bold` | 1.875rem (30px) | 700 | `text-gray-900` |
| Section heading | `text-xl font-semibold` | 1.25rem (20px) | 600 | `text-gray-900` |
| Card title | `text-base font-semibold` | 1rem (16px) | 600 | `text-gray-900` |
| Body / table cell | `text-sm` | 0.875rem (14px) | 400 | `text-gray-700` |
| Secondary / meta | `text-xs` | 0.75rem (12px) | 400 | `text-gray-500` |
| Badge text | `text-xs font-medium` | 0.75rem (12px) | 500 | varies by status |
| Button text | `text-sm font-medium` | 0.875rem (14px) | 500 | `text-white` or `text-gray-700` |
| Table header | `text-xs font-semibold uppercase tracking-wider` | 0.75rem (12px) | 600 | `text-gray-500` |
| ID / code | `font-mono text-xs` | 0.75rem | 400 | `text-gray-500` |

Line height: Tailwind defaults (leading-tight for headings, leading-normal for body).

---

## 6. Spacing System

**Base unit**: 4px (0.25rem). Use multiples only — no arbitrary values unless matching sidebar width.

| Token | px | Tailwind | Common Use Cases |
|-------|-----|----------|-----------------|
| 1 | 4px | `gap-1`, `p-1`, `space-y-1` | Icon gap fine-tuning, tight groups |
| 2 | 8px | `gap-2`, `p-2`, `px-2 py-0.5` | Badge padding, small gaps |
| 3 | 12px | `gap-3`, `px-3 py-2` | Input padding, flex gaps |
| 4 | 16px | `gap-4`, `p-4`, `px-4 py-3` | Card inner padding, table cell padding |
| 6 | 24px | `gap-6`, `p-6`, `space-y-6` | Card padding, section gaps |
| 8 | 32px | `gap-8`, `p-8` | Page section spacing, page padding |
| 16 | 64px | `py-16` | Empty state vertical spacing |

Sidebar width: `w-[250px]` (not `w-64`). Main content: `ml-[250px]`. This is a fixed constraint.

---

## 7. Layout Architecture

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (250px fixed)  │  Main Content (centered)   │
│  ─────────────────────  │  ml-[250px]                │
│  Logo (Bookshop)        │  Page Header               │
│  ─────────────────────  │  (title + action btn)      │
│  Nav items              │  ─────────────────────     │
│  - Dashboard (HomeIcon) │  max-w-[1200px] mx-auto    │
│  - Books   (BookOpenIcon)  │  Card / Table / Form    │
│  - Customers (UserGroupIcon)│  p-8                    │
│  - Orders  (ShoppingCartIcon)│                        │
│  ─────────────────────  │                            │
│  v1.0.0 (bottom)        │                            │
└──────────────────────────────────────────────────────┘
```

### Sidebar (`layouts/Sidebar.tsx`)
```css
width: 250px;
position: fixed;  /* NEVER relative */
top: 0; left: 0; bottom: 0;
background: #111827;  /* bg-gray-900 */
z-index: 40;
overflow-y: auto;
padding: 0;
display: flex; flex-direction: column;
```

**Implementation notes:**
- Logo area: `<div className="px-6 pb-6 pt-6 border-b border-gray-800">` — contains `w-8 h-8 rounded-lg bg-blue-600` logo box + "Bookshop" text
- Nav wrapper: `<nav className="flex-1 px-2 py-4 space-y-0.5">`
- Each nav item: `NavLink` with exact className pattern (see Section 8)
- Bottom area: `<div className="mt-auto px-4 pt-4 pb-4 border-t border-gray-800">` — version text `text-xs text-gray-500`

### Main Content (`layouts/MainLayout.tsx`)
```css
margin-left: 250px;
min-height: 100vh;
background: #F9FAFB;  /* bg-gray-50 */
```

- Content inner: `<div className="p-8 max-w-[1200px] mx-auto">` — uses `<Outlet />` for routed pages. `mx-auto` centers content when viewport is wider than 1200px (applies after `ml-[250px]` offset).
- **Never put sidebar inside the scrollable content area**
- **Never use `ml-64`** — must match sidebar width exactly with `ml-[250px]`

### Page Header (`layouts/PageHeader.tsx`)
```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Books</h1>
    <p className="text-sm text-gray-500 mt-0.5">Manage your book inventory</p>
  </div>
  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
    <PlusIcon className="w-4 h-4" />
    Add Book
  </button>
</div>
```

### Cards
```css
background: white;
border-radius: 8px;  /* rounded-lg */
border: 1px solid #E5E7EB;  /* border border-gray-200 */
box-shadow: 0 1px 3px rgba(0,0,0,0.08);  /* shadow-card */
padding: 1.5rem;  /* p-6 */
```
Usage: `<div className="card">`

### Stats Cards Grid (Dashboard HomePage)
```css
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
```
Each card: icon (colored circle `w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center` → icon inside `w-5 h-5 text-blue-600`) + label (`text-sm text-gray-500`) + number (`text-2xl font-bold text-gray-900`).

---

## 8. Component Specifications (Exact Tailwind)

### 8.1 Buttons

| Variant | Classes |
|---------|---------|
| Primary | `inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors` |
| Secondary | `inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors` |
| Danger | `inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors` |
| Ghost | `inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors` |
| Icon-only (table actions) | `p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors` |

**Rules:**
- Icon inside button: `w-4 h-4` (16px)
- Always add `type="button"` on buttons inside forms
- Loading state: icon becomes Spinner component
- Disabled state: `opacity-50 cursor-not-allowed`

### 8.2 Form Inputs

```jsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">Field Label</label>
  <input
    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
    placeholder="Enter value"
  />
  {/* Error */}
  <p className="text-xs text-red-500 mt-1">Error message</p>
</div>
```

- Input height: ~38px (`px-3 py-2 text-sm`)
- Select: same styling, add `appearance-none` + custom chevron
- Textarea: same border/radius, `resize-y min-h-[80px]`
- Error state: `border-red-500 focus:ring-red-500` + red helper text `text-xs text-red-500`
- Required: add `*` after label in a `text-red-500` span

### 8.3 SearchInput

```jsx
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." />
</div>
```

### 8.4 StatusBadge

| Status | Classes |
|--------|---------|
| Pending | `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700` |
| Shipped | `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700` |
| Delivered | `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700` |

Always include icon: `w-3 h-3` (ClockIcon, TruckIcon, CheckIcon).
Always add `aria-label` or `role="status"`.

### 8.5 Table

```html
<div class="overflow-hidden rounded-lg border border-gray-200">
  <table class="w-full text-sm">
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Column</th>
        <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-gray-700">Value</td>
        <td class="px-4 py-3 text-right">
          <!-- Icon buttons -->
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Rules:**
- ID column (if present): `font-mono text-xs text-gray-500`
- Action column: right-aligned (`text-right`)

### 8.6 Modal

```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
  {/* Dialog (stop propagation) */}
  <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Modal Title</h2>
      <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
    {/* Body */}
    <div className="px-6 py-4 space-y-4">Content</div>
    {/* Footer */}
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
      <button className="...secondary...">Cancel</button>
      <button className="...primary...">Save</button>
    </div>
  </div>
</div>
```

Sizes: `sm` → `max-w-sm`, `md` → `max-w-md`, `lg` → `max-w-2xl`.
Close on: backdrop click, ESC key, X button.
Animation: `animate-fade-in` on overlay + dialog.

### 8.7 ConfirmDialog

Same structure as Modal but simpler:
- Title: "Delete Book?"
- Warning icon (optional): `ExclamationTriangleIcon w-12 h-12 text-red-500`
- Body text: `text-sm text-gray-500`
- Confirm: danger variant button
- Cancel: secondary variant button

### 8.8 EmptyState

```jsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
    <BookOpenIcon className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-base font-semibold text-gray-900 mb-1">No books found</h3>
  <p className="text-sm text-gray-500 mb-4">Add your first book to get started.</p>
  <PrimaryButton>Add Book</PrimaryButton>
</div>
```

### 8.9 Spinner

```jsx
<div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
```

Sizes: `sm` → `w-4 h-4`, `md` → `w-5 h-5`, `lg` → `w-8 h-8`.

### 8.10 Pagination

```jsx
<div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-500">Rows per page:</span>
    <select className="text-sm border border-gray-300 rounded px-2 py-1" value={pageSize} onChange={...}>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
    </select>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
    <div className="flex items-center gap-1">
      <button disabled={page <= 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded" onClick={...}>
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      {pageNumbers.map(p => (
        <button key={p} className={`px-2 py-0.5 text-sm rounded ${p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={...}>
          {p}
        </button>
      ))}
      <button disabled={page >= totalPages} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded" onClick={...}>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

### 8.12 Stock History Modal

```jsx
<div className="space-y-4">
  <p className="text-sm text-gray-500">Stock changes for <span className="font-medium text-gray-700">{bookTitle}</span></p>
  <div className="overflow-x-auto border border-gray-200 rounded-lg">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">After</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {movements.map(m => (
          <tr key={m.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-gray-500 text-xs font-mono">{format(m.createdAt)}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {m.reason}
              </span>
            </td>
            <td className={`px-4 py-3 text-center font-mono ${m.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
            </td>
            <td className="px-4 py-3 text-center font-mono">{m.newStock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
</div>
```

### 8.13 Export Button

```jsx
<button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
  <ArrowDownTrayIcon className="w-4 h-4" />
  Export CSV
</button>
```

### 8.14 Alert / Toast

Toast:
```css
position: fixed; top: 1rem; right: 1rem;
z-index: 100;
```
- Auto-dismiss after 3s
- Slide-in from right: `animate-slide-in-right`
- Variants: success (green), error (red), info (blue), warning (yellow)
- Each: `bg-white rounded-lg shadow-lg p-4 border-l-4` with appropriately colored left border

### 8.11 Cards (Dashboard)

- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- Each card: `card-hover flex items-center gap-4`
- Icon container: `w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0`
- Icon: `w-6 h-6 text-blue-600`
- Content: label `text-sm text-gray-500`, value `text-2xl font-bold text-gray-900`

---

## 9. Sidebar Nav Item Pattern (Exact)

```jsx
<NavLink
  to="/books"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`
  }
>
  <BookOpenIcon className="w-4 h-4 shrink-0" />
  <span>Books</span>
</NavLink>
```

**Current nav items:**
| Route | Label | Icon (outline) |
|-------|-------|----------------|
| `/` | Dashboard | `HomeIcon` |
| `/books` | Books | `BookOpenIcon` |
| `/customers` | Customers | `UserGroupIcon` |
| `/orders` | Orders | `ShoppingCartIcon` |
| `/audit-log` | Audit Log | `ClipboardDocumentCheckIcon` |

---

## 10. Icon Usage Guide

**Library**: `@heroicons/react/24/outline` (default), `/24/solid` for emphasis (active nav, filled states).

| Context | Variant | Size | Icon Example |
|---------|---------|------|-------------|
| Sidebar nav icon | outline | `w-4 h-4` | BookOpenIcon, UserGroupIcon |
| Button icon (inline) | outline | `w-4 h-4` | PlusIcon, PencilIcon |
| Status badge icon | outline | `w-3 h-3` | ClockIcon, TruckIcon, CheckIcon |
| Stats card icon | solid | `w-5 h-5` (or `w-6 h-6`) | depends on metric |
| Empty state icon | outline | `w-8 h-8` | BookOpenIcon, MagnifyingGlassIcon |
| Modal close X | outline | `w-5 h-5` | XMarkIcon |
| Search icon | outline | `w-4 h-4` | MagnifyingGlassIcon |
| Toast icon | outline | `w-5 h-5` | CheckCircleIcon, ExclamationCircleIcon |
| Page header action | outline | `w-4 h-4` | PlusIcon |

**Icon + label structure:**
```jsx
<div className="flex items-center gap-3">
  <Icon className="w-5 h-5 shrink-0" />
  <span>Label</span>
</div>
```

**CRITICAL RULES:**
- NEVER render `<UserIcon />` without a size class — it will fill its container
- ALWAYS set `shrink-0` on icons inside flex containers
- NEVER use raw `<svg>` — always use @heroicons/react components
- ALWAYS `import { XMarkIcon } from '@heroicons/react/24/outline'`

---

## 11. Animation & Transitions

| Element | Animation | Tailwind |
|---------|-----------|----------|
| All interactive | color/background transition | `transition-colors duration-150` |
| Modal open | scale + fade | `animate-fade-in` (scale 0.95 → 1, opacity 0 → 1) |
| Toast slide-in | slide from right | `animate-slide-in-right` |
| Sidebar mobile | slide from left | `transition-transform duration-300 ease-in-out` |
| Spinner | infinite rotation | `animate-spin` |
| Table rows | bg highlight | `hover:bg-gray-50 transition-colors` |
| Card hover | shadow lift | `hover:shadow-card-hover transition-shadow duration-150` |
| Button hover | color shift | `hover:bg-blue-700 transition-colors` |

---

## 12. Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| sm | 640px | Grid columns stack (1→2 cols) |
| md | 768px | Sidebar collapses to icon-only drawer |
| lg | 1024px | Full sidebar restored |
| xl | 1280px | Max content width `max-w-[1200px]` caps layout |

Mobile (< 768px):
- Sidebar becomes a drawer (hidden by default, toggled with hamburger)
- `ml-0` on main content
- Tables become scrollable (`overflow-x-auto`)

---

## 13. Accessibility Requirements (WCAG 2.1 AA)

- Every `<button>` without visible text MUST have `aria-label`
- All `<input>` elements MUST have associated `<label>` (htmlFor + id)
- Status badges MUST have `role="status"` or `aria-label` describing status
- Focus indicator: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1` (applied globally in `index.css`)
- Color is NEVER the only indicator — always pair with icon or text
- Minimum touch target: 44×44px for mobile buttons
- Keyboard navigation: Tab through fields, Enter to submit, Esc to close modals
- Color contrast ratios: all text meets AA minimum (4.5:1 normal, 3:1 large)

---

## 14. Anti-Patterns (Must Avoid)

| Wrong | Correct |
|-------|---------|
| `<UserIcon />` no size | `<UserIcon className="w-5 h-5" />` |
| Icon in `<a>` without flex wrapper | `<div className="flex items-center gap-3"><Icon /><span>` |
| Sidebar `position: relative` | `position: fixed` |
| `ml-64` for sidebar offset | `ml-[250px]` (matches `w-[250px]`) |
| Table without `overflow-x-auto` wrapper | Wrap `<table>` in `overflow-x-auto` div |
| Button without `type="button"` in form | Always set `type` explicitly |
| Inline `<svg>` copy-pasted | Use @heroicons/react component with size class |
| Magic numbers for spacing | Use Tailwind spacing scale (1/2/3/4/6/8) |

---

## 15. Data Models (for UI binding)

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'pending' | 'shipped' | 'delivered';

interface Order {
  id: string;
  customerId: string;
  bookId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface StockMovement {
  id: string;
  bookId: string;
  oldStock: number;
  newStock: number;
  quantity: number;
  reason: 'order_deduction' | 'manual_restock' | 'manual_adjustment' | 'correction';
  referenceId?: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  entityType: 'book' | 'customer' | 'order';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  previousState?: any;
  newState?: any;
  performedBy: string;
  createdAt: string;
}
```

---

## 16. HomePage — Book Management Dashboard

The HomePage (`/`) is a book-focused dashboard. It replaces the generic module-card layout with actionable inventory data.

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  Page intro: Bookshop Management (centered, no action btn) │
│  ──────────────────────────────────────────────────────── │
│  Stats Row: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Total    │ │ Out of   │ │ Low      │ │ Total    │     │
│  │ Books    │ │ Stock    │ │ Stock    │ │ Value    │     │
│  │   42     │ │    3     │ │    7     │ │ $8,420   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ──────────────────────────────────────────────────────── │
│  Two-column grid: lg:grid-cols-2 gap-6                    │
│                                                           │
│  ┌────────────────────┐  ┌────────────────────┐          │
│  │ Recent Books       │  │ Low Stock Alerts   │          │
│  │ (compact table)    │  │ (alert cards)      │          │
│  │                    │  │                    │          │
│  │ Title  Author Price│  │ ⚠ The Great Gatsby │          │
│  │ ...    ...    ...  │  │   Stock: 2 units   │          │
│  │ ...    ...    ...  │  │ ⚠ Dune            │          │
│  │                    │  │   Stock: 1 unit    │          │
│  │ View All →         │  │ View All →         │          │
│  └────────────────────┘  └────────────────────┘          │
└────────────────────────────────────────────────────────────┘
```

### Stats Cards

```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
```

Each stats card:
```jsx
<div className="card-hover">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-blue-50">
      <BookOpenIcon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Total Books</p>
      <p className="text-2xl font-bold text-gray-900">42</p>
    </div>
  </div>
</div>
```

| Stat | Icon Container | Icon | 
|------|----------------|------|
| Total Books | `bg-blue-50` | `BookOpenIcon w-6 h-6 text-blue-600` |
| Out of Stock | `bg-red-50` | `XCircleIcon w-6 h-6 text-red-500` |
| Low Stock | `bg-amber-50` | `ExclamationTriangleIcon w-6 h-6 text-amber-500` |
| Total Value | `bg-emerald-50` | `CurrencyDollarIcon w-6 h-6 text-emerald-600` |

### Recent Books Section

Card with title "Recent Books" and a compact table showing last 5 books:
- Title (bold)
- Author (gray-600 text-sm)
- Price (right-aligned, font-mono)
- Stock badge (colored pill)

Footer link: "View All →" linking to `/books`.

### Low Stock Alerts Section

Card with title "Low Stock Alerts". Shows books with stock < 5 as individual alert items:

```jsx
<div className="flex items-center justify-between py-3 px-4 rounded-lg bg-amber-50 border border-amber-200">
  <div className="flex items-center gap-3">
    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
    <div>
      <p className="text-sm font-medium text-amber-800">The Great Gatsby</p>
      <p className="text-xs text-amber-600">Stock: 2 units</p>
    </div>
  </div>
  <Link to="/books" className="text-xs font-medium text-amber-700 hover:text-amber-800 underline">
    Restock
  </Link>
</div>
```

Empty state: "All books are well-stocked" with CheckCircleIcon.

### Loading State

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  {[1,2,3,4].map(i => (
    <div key={i} className="card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  ))}
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {[1,2].map(i => (
    <div key={i} className="card">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-4" />
      {[1,2,3].map(j => (
        <div key={j} className="h-10 bg-gray-100 rounded animate-pulse mb-2" />
      ))}
    </div>
  ))}
</div>
```

### Error State

Uses Alert component inline:
```jsx
<Alert
  variant="error"
  title="Failed to load dashboard"
  message="Could not load book data. Please try again."
  onClose={() => fetchDashboard()}
/>
```

### Empty State

If no books exist at all:
```jsx
<EmptyState
  icon={<BookOpenIcon className="w-8 h-8 text-gray-400" />}
  title="No books yet"
  message="Add your first book to start managing your inventory."
  action={{ label: 'Add Book', onClick: () => navigate('/books') }}
/>
```

### States Summary

| State | Condition | UI |
|-------|-----------|----|
| Loading | `loading && !data` | Skeleton placeholders (4 stat + 2 card) |
| Error | `error` | Alert component with retry |
| Empty | no books exist | EmptyState with CTA |
| Loaded | books exist | Stats + Recent Books + Low Stock Alerts |
| No low stock | all books stock >= 5 | CheckCircleIcon message in alerts card |

---

## 17. Page Structure Reference

Each page follows this pattern:
```
PageHeader (title + description + action buttons + optional Export CSV)
  ↓
SearchInput (if list page)
  ↓
Content area: Table | Grid | Single card
  ↓
Pagination (below table on list pages)
  ↓
Modal (for add/edit forms, stock history)
  ↓
ConfirmDialog (for delete confirmations)
  ↓
Toast notifications (top-right, auto-dismiss)
```

All API data fetching uses custom hooks (`useBooks`, `useCustomers`, `useOrders`) with loading (Spinner), empty (EmptyState), error (Alert), and success states.

---

## 18. Common Tailwind Patterns Reference

| Pattern | Classes |
|---------|---------|
| Flex row with gap | `flex items-center gap-3` |
| Flex row with space-between | `flex items-center justify-between` |
| Truncate text | `truncate` |
| Visually hidden label | `sr-only` |
| Monospace ID | `font-mono text-xs text-gray-500` |
| Shimmer loading | `animate-pulse bg-gray-200 rounded` |
| Custom scrollbar | `overflow-x-auto` |
| Form section spacing | `space-y-4` |

---

*This context file consolidates `ui-specifications.md`, `component-library.md`, and `design.md` into a single reference. For API contracts, see `06-contracts/01-apis/rest/*.yaml`.*
