# Repository Purpose & Architecture

> Domain knowledge and interface contracts for the Bookshop Management System ecosystem

## 🎯 Purpose

This repository serves as the **central domain knowledge and interface contract layer** for the Bookshop Management System. It will be imported as a **git submodule** into all implementation repositories (backend, frontend, mobile).

## 🏗️ What This Repository Contains

### ✅ **Included**

1. **Business Domain Knowledge**
   - Business processes and rules
   - Requirements and features
   - User stories and workflows

2. **High-Level Technical Architecture**
   - System overview and context
   - Module boundaries and responsibilities
   - Integration patterns
   - Architectural principles and decisions

3. **Interface Contracts** (THE GLUE)
   - **API Contracts**: REST endpoint definitions
   - **Event Contracts**: Event schemas for async communication
   - **Data Contracts**: Shared data models and schemas
   - These define HOW different systems communicate

### ❌ **Not Included**

1. **Concrete Implementation**
   - Actual code (backend logic, frontend components, etc.)
   - Framework-specific details
   - Build configurations
   - Deployment scripts

2. **Implementation-Specific Architecture**
   - Detailed class diagrams
   - Internal service structure
   - Database migration files
   - Infrastructure as code

---

## 🔗 Repository Relationship

### This Repository as a Submodule

```bash
# Backend repo structure
bookshop-backend/
├── domain/  (git submodule → bookshop-product-context)
│   ├── 02-domain/
│   ├── 04-architecture/
│   ├── 05-modules/
│   └── 06-contracts/
├── src/
├── tests/
└── package.json

# Frontend repo structure
bookshop-frontend/
├── domain/  (git submodule → bookshop-product-context)
│   ├── 06-contracts/
│   ├── 07-design-system/
│   └── 05-modules/
├── src/
└── package.json

# Mobile repo structure
bookshop-mobile/
├── domain/  (git submodule → bookshop-product-context)
│   ├── 06-contracts/
│   ├── 07-design-system/
│   └── 05-modules/
├── src/
└── package.json
```

### How Implementation Repos Use This

```typescript
// Backend imports contracts from submodule
import { BookDTO } from '../domain/contracts/api/books';
import { OrderCreatedEvent } from '../domain/contracts/events/order-events';

// Frontend imports contracts from submodule
import { BookDTO } from '../domain/contracts/api/books';
import { ApiEndpoints } from '../domain/contracts/api/endpoints';

// Mobile imports contracts from submodule
import { BookDTO } from '../domain/contracts/api/books';
import { OrderStatusEnum } from '../domain/contracts/enums/order-status';
```

---

## 📂 Repository Structure

```
bookshop-product-context/
├── README.md
├── 01-PRODUCT_VISION.md           # Product vision
├── 02-REPOSITORY_PURPOSE.md       # This file
│
├── 01-source/                     # Original source documents
├── 02-domain/                     # Business domain context
├── 03-backlog/                    # (removed — consolidated into modules)
├── 04-architecture/               # System architecture, ADRs
│   ├── 01-system-design/          # C4 diagrams
│   ├── 03-decisions/              # ADRs
│   ├── 04-backend/                # Backend architecture
│   └── 06-deployment/             # Deployment strategy
├── 05-modules/                    # Technical module specs
├── 06-contracts/                  # THE INTERFACE LAYER
│   ├── 01-apis/rest/              # OpenAPI 3.0 specs
│   ├── 02-data-models/            # Shared data schemas
│   ├── 03-events/                 # Event contracts
│   └── 04-integration/            # External integrations
├── 07-design-system/              # UI/UX design system
├── 08-development-guides/         # Implementation guides
├── 09-testing/                    # Testing strategy
├── 10-reference/                  # Data dictionaries
└── 11-change-requests/            # Change management
```

---

## 🎯 Key Principles

### 1. **Single Source of Truth**
- Business domain knowledge lives here
- Interface contracts defined once, used everywhere
- All repos reference the same contracts

### 2. **High-Level Abstraction**
- Focus on WHAT and WHY, not HOW
- Module boundaries, not implementation details
- Contracts, not code

### 3. **Technology Agnostic**
- Contracts in YAML/JSON Schema
- Can be consumed by any tech stack
- Backend (Node.js/Python), Frontend (React), Mobile (React Native)

### 4. **Version Controlled**
- Contract changes tracked in git
- All repos see contract updates via submodule
- Breaking changes require coordination

### 5. **Documentation First**
- Business requirements documented before contracts
- Contracts defined before implementation
- Implementation repos reference contracts

---

## 🔄 Development Workflow

### Phase 1: Business Context
1. ✅ Gather requirements from stakeholders
2. ✅ Organize source documents
3. ✅ Document business processes

### Phase 2: High-Level Architecture
1. Define system context (C4 Level 1)
2. Define module boundaries (C4 Level 2)
3. Define integration patterns
4. Make architectural decisions (ADRs)

### Phase 3: Interface Contracts
1. Define API contracts (OpenAPI)
2. Define event contracts
3. Define data models
4. Define message contracts

### Phase 4: Implementation (In Separate Repos)
1. Create implementation repos (backend, frontend, mobile)
2. Add this repo as git submodule
3. Import contracts from submodule
4. Implement concrete logic

---

## 📋 Contract Example

### API Contract (YAML)

**File**: `06-contracts/01-apis/rest/books.yaml`

```yaml
openapi: 3.0.0
info:
  title: Book Management API
  version: 1.0.0

paths:
  /api/v1/books:
    post:
      summary: Add a new book
      operationId: addBook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBookRequest'
      responses:
        '201':
          description: Book created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookResponse'

components:
  schemas:
    CreateBookRequest:
      type: object
      required:
        - title
        - author
        - price
        - stock
      properties:
        title:
          type: string
        author:
          type: string
        price:
          type: number
          minimum: 0
        stock:
          type: integer
          minimum: 0
```

### Event Contract (YAML)

**File**: `06-contracts/03-events/order-events.yaml`

```yaml
events:
  OrderCreated:
    version: 1.0.0
    description: Emitted when a new order is created
    payload:
      type: object
      required:
        - orderId
        - customerId
        - bookId
        - quantity
        - createdAt
      properties:
        orderId:
          type: string
          format: uuid
        customerId:
          type: string
          format: uuid
        bookId:
          type: string
          format: uuid
        quantity:
          type: integer
          minimum: 1
        createdAt:
          type: string
          format: date-time
```

### How Repos Use These Contracts

```typescript
// Backend (bookshop-backend/src/services/book.service.ts)
import { CreateBookRequest } from '../domain/contracts/api/books';
import { OrderCreatedEvent } from '../domain/contracts/events/order-events';

class BookService {
  async addBook(request: CreateBookRequest) {
    // Implementation
    const book = await this.repository.create(request);
    
    return book;
  }
}

// Frontend (bookshop-frontend/src/api/book.api.ts)
import { CreateBookRequest } from '../domain/contracts/api/books';

class BookAPI {
  async addBook(request: CreateBookRequest) {
    return await fetch('/api/v1/books', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
```

---

## ✅ Benefits of This Approach

### 1. **Consistency**
- All systems speak the same language
- Same data structures everywhere
- No "translation" bugs

### 2. **Contract-First Development**
- Define contracts before implementing
- Frontend and backend develop in parallel
- Clear expectations

### 3. **Type Safety**
- Generate types from contracts
- Compile-time errors for violations
- Reduced runtime errors

### 4. **Documentation**
- Contracts are self-documenting
- Always up-to-date
- Single source of truth

### 5. **Versioning**
- Track contract changes via git
- Coordinate breaking changes
- Clear migration path

---

## 🔄 Updating This Repository

### When to Update

1. **New Feature**: Requirement → Update docs → Define contracts
2. **API Change**: Update contract → Coordinate with repos
3. **Architecture Decision**: Document in ADR
4. **Business Rule Change**: Update domain docs

### Update Process

```bash
# In this repo
git checkout -b feature/add-book-rating-api
# Update contracts/api/rest/books.yaml
git commit -m "Add book rating API contract"
git push

# In implementation repos (after merge)
cd bookshop-backend
git submodule update --remote domain
# Now backend sees new contracts
```

---

## 🎯 Summary

**This repository is:**
- ✅ Business domain knowledge
- ✅ High-level technical architecture
- ✅ Interface contracts (APIs, Events, Data Models)
- ✅ The GLUE between all implementation repos
- ✅ A git submodule for backend, frontend, mobile repos

**This repository is NOT:**
- ❌ Concrete implementation code
- ❌ Framework-specific details
- ❌ Infrastructure as code
- ❌ Build configurations

---

**Repository Type**: Domain Context + Interface Contracts  
**Usage**: Git submodule in all implementation repos  
**Audience**: Product managers, Business analysts, Architects, All developers  
**Purpose**: Single source of truth for domain knowledge and system integration  
**Last Updated**: June 2026
