# Category Management Module

## Overview
Manages book categories. Categories group books into taxonomy for browsing and filtering.

## Dependencies
- **Book Management** — Category is assigned to Book via `categoryId`

## Data Model
```typescript
interface Category {
  id: string;
  name: string;      // unique, max 100
  description: string; // max 500
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/v1/categories` | Create category |
| GET    | `/api/v1/categories` | List all categories |
| GET    | `/api/v1/categories/:id` | Get category by ID |
| PUT    | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category (blocked if books assigned) |

## Business Rules
- BR-CATEGORY-001: Name must be unique
- BR-CATEGORY-002: Name max 100 chars
- BR-CATEGORY-003: Description max 500 chars
- BR-CATEGORY-004: Cannot delete if books assigned
- BR-CATEGORY-005: Book creation requires a valid category

## Frontend Routes
| Route | Page | Description |
|-------|------|-------------|
| `/categories` | CategoriesPage | CRUD table for categories |
| `/books` | BooksPage | Category filter + selector in book form |
