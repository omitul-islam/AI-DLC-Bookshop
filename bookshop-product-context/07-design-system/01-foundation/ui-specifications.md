# UI Specifications — Bookshop Management System
**Design System Version**: 2.0.0  
**Last Updated**: June 2026

---

## ⚠️ Critical Implementation Rules (Read First)

These rules exist because AI-generated code commonly breaks these. Follow strictly.

### Icon Rules
- **ALWAYS** set explicit size on every icon: `width={20} height={20}` or Tailwind `w-5 h-5`
- **NEVER** render a raw `<svg>` without size constraints — it will fill its container
- Sidebar nav icons: `w-5 h-5` (20px) — never larger
- Button icons: `w-4 h-4` (16px)
- Empty state / hero icons: `w-12 h-12` (48px)
- Icon + label must always be in a flex row: `<div className="flex items-center gap-3"><Icon className="w-5 h-5 shrink-0" /><span>Label</span></div>`
- `shrink-0` on every icon to prevent squishing

### Sidebar Nav Item Structure (exact)
```jsx
<NavLink
  to="/customers"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
     ${isActive
       ? 'bg-blue-600 text-white'
       : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
  }
>
  <UserIcon className="w-5 h-5 shrink-0" />
  <span>Customers</span>
</NavLink>
```

### Layout Rules
- Sidebar is `fixed` left, never relative/absolute inside a scroll container
- Main content has `ml-[250px]` to offset sidebar width
- Never put sidebar inside the scrollable content area

---

## Color Palette

### Primary
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#3B82F6` | Buttons, links, active states |
| `primary-dark` | `#2563EB` | Hover on primary |
| `primary-light` | `#DBEAFE` | Badge backgrounds, highlights |

### Status
| Token | Hex | Usage |
|---|---|---|
| `success` | `#10B981` | Delivered, positive |
| `warning` | `#F59E0B` | Pending, caution |
| `error` | `#EF4444` | Errors, delete actions |
| `info` | `#3B82F6` | Shipped, informational |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `gray-50` | `#F9FAFB` | Page background |
| `gray-100` | `#F3F4F6` | Card backgrounds, table rows alt |
| `gray-200` | `#E5E7EB` | Borders, dividers |
| `gray-500` | `#6B7280` | Secondary/placeholder text |
| `gray-700` | `#374151` | Body text |
| `gray-900` | `#111827` | Primary text, sidebar bg |

---

## Typography

**Font**: `Inter, system-ui, sans-serif` — load from Google Fonts or use system-ui fallback.  
**Monospace**: `'Courier New', monospace` — only for IDs, order numbers, codes.

| Role | Size | Weight | Color |
|---|---|---|---|
| Page title | 1.875rem (30px) | 700 | gray-900 |
| Section heading | 1.25rem (20px) | 600 | gray-900 |
| Card title | 1rem (16px) | 600 | gray-900 |
| Body / table cell | 0.875rem (14px) | 400 | gray-700 |
| Secondary / meta | 0.75rem (12px) | 400 | gray-500 |
| Badge text | 0.75rem (12px) | 500 | varies |
| Button text | 0.875rem (14px) | 500 | white or gray-700 |

---

## Spacing

Base unit: 4px. Use multiples only.

| Token | Value | Common use |
|---|---|---|
| `1` | 4px | Icon gap fine-tuning |
| `2` | 8px | Badge padding, tight gaps |
| `3` | 12px | Input padding vertical |
| `4` | 16px | Card inner padding, nav item px |
| `6` | 24px | Card padding, section gap |
| `8` | 32px | Page section spacing |

---

## Layout

### Overall Structure
```
┌─────────────────────────────────────────────┐
│  Sidebar (250px fixed)  │  Main Content      │
│  ─────────────────────  │  ml-[250px]        │
│  Logo                   │  Header bar        │
│  ─────────────────────  │  ──────────────    │
│  Nav items              │  Page content      │
│  (icon + label)         │  max-w-[1200px]    │
│                         │  p-8               │
│  ─────────────────────  │                    │
│  User / logout          │                    │
└─────────────────────────────────────────────┘
```

### Sidebar
```css
width: 250px;
position: fixed;
top: 0; left: 0; bottom: 0;
background: #111827;  /* gray-900 */
padding: 1.5rem 0;
display: flex;
flex-direction: column;
overflow-y: auto;
z-index: 40;
```

- Logo area: `px-6 pb-6 border-b border-gray-800`
- Nav section label: `px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider`
- Nav item: `mx-2 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm`
- Active nav item: `bg-blue-600 text-white`
- Inactive nav item: `text-gray-400 hover:bg-gray-800 hover:text-white`
- Bottom user area: `mt-auto px-4 pt-4 border-t border-gray-800`

### Main Content Area
```css
margin-left: 250px;
min-height: 100vh;
background: #F9FAFB;
padding: 2rem;
```

### Cards
```css
background: white;
border-radius: 0.5rem;
border: 1px solid #E5E7EB;
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
padding: 1.5rem;
```

### Stats Cards (Dashboard)
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- Each card: icon (colored bg circle, w-10 h-10) + label + big number
- Icon container: `w-10 h-10 rounded-full flex items-center justify-center bg-blue-100`
- Icon inside: `w-5 h-5 text-blue-600`

---

## Components

### Buttons

#### Primary
```jsx
<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
  <PlusIcon className="w-4 h-4" />
  Add Book
</button>
```

#### Secondary
```jsx
<button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
  Export
</button>
```

#### Danger
```jsx
<button className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors">
  <TrashIcon className="w-4 h-4" />
  Delete
</button>
```

#### Icon-only button (table actions)
```jsx
<button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
  <PencilIcon className="w-4 h-4" />
</button>
```

### Form Inputs

```jsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input
    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
    placeholder="Enter email"
  />
</div>
```

- Input height: `38px` (py-2 + text-sm)
- Select: same styling as input, add `appearance-none` + custom chevron
- Textarea: same border/radius, `resize-y min-h-[80px]`
- Error state: `border-red-500 focus:ring-red-500` + red helper text below

### Search Bar
```jsx
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." />
</div>
```

### Status Badges

```jsx
// Pending
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
  <ClockIcon className="w-3 h-3" /> Pending
</span>

// Shipped
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
  <TruckIcon className="w-3 h-3" /> Shipped
</span>

// Delivered
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
  <CheckIcon className="w-3 h-3" /> Delivered
</span>
```

### Tables

```jsx
<div className="overflow-hidden rounded-lg border border-gray-200">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-gray-700">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

- Row hover: `hover:bg-gray-50`
- Action column: right-aligned, icon-only buttons with hover color
- ID column: `font-mono text-xs text-gray-500`

### Modal / Dialog

```jsx
// Overlay
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  // Dialog
  <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
    // Header
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Title</h2>
      <button className="p-1 text-gray-400 hover:text-gray-600 rounded"><XMarkIcon className="w-5 h-5" /></button>
    </div>
    // Body
    <div className="px-6 py-4 space-y-4">...</div>
    // Footer
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
      <SecondaryButton>Cancel</SecondaryButton>
      <PrimaryButton>Save</PrimaryButton>
    </div>
  </div>
</div>
```

### Empty State

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

### Page Header (standard)

```jsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
    <p className="text-sm text-gray-500 mt-0.5">Manage your customer records</p>
  </div>
  <PrimaryButton>Add Customer</PrimaryButton>
</div>
```

---

## Icons

**Library**: `@heroicons/react` (v2) — preferred. Fallback: `lucide-react`.

```jsx
import { UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
// Use /24/solid for emphasis (active nav, filled states)
```

| Context | Icon name | Size class |
|---|---|---|
| Sidebar nav | outline variant | `w-5 h-5` |
| Buttons | outline variant | `w-4 h-4` |
| Status badges | outline variant | `w-3 h-3` |
| Stats card | solid variant | `w-5 h-5` |
| Empty state | outline variant | `w-8 h-8` |
| Close/dismiss | `XMarkIcon` | `w-5 h-5` |

**⚠️ Never use SVG icons without explicit Tailwind size classes.**

---

## Sidebar Nav Items

```
Dashboard    → HomeIcon         → /
Books        → BookOpenIcon     → /books
Customers    → UserIcon         → /customers
Orders       → ShoppingCartIcon → /orders
```

Each item renders as: `[Icon w-5 h-5] [Label text-sm]` in a flex row.  
Never render icon alone without label in expanded sidebar.

---

## Responsive Breakpoints

| Name | Width | Behavior |
|---|---|---|
| SM | 640px | Stack grid cols |
| MD | 768px | Sidebar collapses to icon-only |
| LG | 1024px | Full sidebar restored |
| XL | 1280px | Max content width kicks in |

On mobile (`< 768px`): sidebar becomes a drawer, toggle with hamburger button. Main content takes full width (`ml-0`).

---

## Accessibility

- Every `<button>` without visible text must have `aria-label`
- All form `<input>` must have associated `<label>` (htmlFor + id)
- Status badges must have `role="status"` or `aria-label`
- Focus ring: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Color is never the only indicator — always pair with icon or text
- Min touch target: 44×44px for mobile buttons

---

## Animation & Transitions

- All interactive elements: `transition-colors duration-150`
- Modal open: `animate-in fade-in zoom-in-95 duration-200`
- Sidebar slide (mobile): `transition-transform duration-300 ease-in-out`
- Skeleton loader: `animate-pulse bg-gray-200 rounded`
- Spinner: `animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full`

---

## Common Anti-patterns to Avoid

| ❌ Wrong | ✅ Correct |
|---|---|
| `<UserIcon />` with no size | `<UserIcon className="w-5 h-5" />` |
| Icon inside `<a>` as block | Wrap in `flex items-center gap-3` |
| Sidebar with `position: relative` | `position: fixed` |
| `overflow: hidden` on sidebar parent | Never clip the sidebar |
| Raw `<svg>` from copy-paste | Always use icon component with size |
| `ml-64` when sidebar is `w-[250px]` | Use `ml-[250px]` to match exactly |
| Table without `overflow-x-auto` wrapper | Always wrap table for mobile |
| Button without `type="button"` in forms | Always set `type` explicitly |