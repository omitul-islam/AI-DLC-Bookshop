# Bookshop Frontend

React + TypeScript + Vite frontend for the Bookshop Management System, following the AI-DLC pattern.

## 🎯 Features Implemented

### ✅ All Frontend User Stories (16 Story Points)

- **US-010**: Book Management UI (5 pts)
- **US-011**: Customer Management UI (3 pts)
- **US-012**: Order Management UI (8 pts)

## 🏗️ Architecture

Built following: `../bookshop-product-context/04-architecture/01-system-design/frontend-architecture.md`

### Tech Stack
- React 18.2
- TypeScript 5.3
- Vite 5.0
- Tailwind CSS 3.4
- React Router 6
- React Hook Form + Zod
- Axios

### Folder Structure
```
src/
├── api/              # API clients (matches OpenAPI)
├── components/       # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
├── utils/            # Utilities
└── App.tsx           # Main app
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

Backend must be running on http://localhost:3000

## 📱 Pages

### Books Page (`/books`)
- List all books with search
- Add new book
- Edit book
- Delete book with confirmation
- Real-time validation

### Customers Page (`/customers`)
- List all customers
- Add new customer
- Email uniqueness validation
- Phone format validation

### Orders Page (`/orders`)
- Create order with stock validation
- List orders with status filters
- Update order status (pending → shipped → delivered)
- Prevent invalid status transitions

## 🎨 Design System

Implemented from: `../bookshop-product-context/07-design-system/`

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

### Components
- Buttons (primary, secondary, danger)
- Form inputs with validation
- Modals
- Status badges
- Tables
- Cards

## 📋 Context Traceability

Every component references the product context:

- **UI Specs**: `context/07-design-system/01-foundation/ui-specifications.md`
- **Components**: `context/07-design-system/02-components/component-library.md`
- **API Contracts**: `context/06-contracts/01-apis/rest/*.yaml`

## 🧪 Testing

### Manual Testing Checklist

**Books:**
- [ ] Load page shows all books
- [ ] Search filters results
- [ ] Add book form validation works
- [ ] Edit book updates correctly
- [ ] Delete confirms and removes book

**Customers:**
- [ ] List shows all customers
- [ ] Add customer with valid email works
- [ ] Duplicate email shows error
- [ ] Invalid phone format rejected

**Orders:**
- [ ] Create order form loads customers and books
- [ ] Stock validation prevents overselling
- [ ] Order status updates follow workflow
- [ ] Invalid transitions prevented

## 📦 Build

```bash
# Production build
npm run build

# Preview build
npm run preview
```

Output in `dist/` directory

## 🔗 Backend Integration

Frontend expects backend on:
- Development: `http://localhost:3000/api/v1`
- Production: Set `VITE_API_URL` environment variable

## 🎓 AI-DLC Pattern

This frontend demonstrates the AI-DLC pattern:

**Product Context** (separate repo) defines:
- WHAT to build (user stories, UI specs)
- Design system and components
- API contracts

**Frontend** (this repo) implements:
- HOW to build it with React
- Component implementation
- State management

## 📊 Stats

- **3 Pages**: Books, Customers, Orders
- **20+ Components**: Buttons, Forms, Modals, etc.
- **3 API Clients**: Books, Customers, Orders
- **Type-safe**: Full TypeScript coverage
- **Validated**: Zod schemas matching backend

---

**Built with AI-DLC Pattern** 🧠  
**All User Stories**: ✅ Complete  
**Implementation Time**: <2 hours
