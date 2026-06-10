# Category Business Rules

## BR-CATEGORY-001: Category Name Uniqueness
- **Rule**: Category name must be unique (case-insensitive)
- **Enforcement**: Server-side validation in service layer before create/update
- **Error**: `409 Conflict` — "Category with this name already exists"

## BR-CATEGORY-002: Category Name Length
- **Rule**: Category name must be between 1 and 100 characters
- **Enforcement**: Zod schema in validator
- **Error**: `400 Bad Request` — validation error

## BR-CATEGORY-003: Category Description Length
- **Rule**: Category description must be between 1 and 500 characters
- **Enforcement**: Zod schema in validator
- **Error**: `400 Bad Request` — validation error

## BR-CATEGORY-004: Prevent Delete With Assigned Books
- **Rule**: A category cannot be deleted if books are still assigned to it
- **Enforcement**: Server-side check in service layer before delete
- **Error**: `409 Conflict` — "Cannot delete category: N book(s) are assigned to it"

## BR-CATEGORY-005: Required on Book Creation
- **Rule**: Every book must be assigned to a category
- **Enforcement**: Zod schema in book validator, server-side validation in book service (category existence check)
- **Error**: `400 Bad Request` — validation error / `400` — "Category not found"
