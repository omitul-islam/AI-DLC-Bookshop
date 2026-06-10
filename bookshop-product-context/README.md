# Bookshop Management System - Product Context

> **AI-DLC structured repository: Domain knowledge separate from implementation**

---

## 🎯 What is This Repository?

This is an **AI-DLC (AI Development Lifecycle)** structured repository containing:

- Business requirements and domain rules
- API contracts and data schemas
- Architecture decisions
- User stories with acceptance criteria

**Key Principle**: This repo contains WHAT to build, not HOW to build it. Implementation code lives in separate repos that reference this as a submodule.

---

## 🚀 Quick Start

### First Time Here?

1. **Product Vision**: Read [01-PRODUCT_VISION.md](./01-PRODUCT_VISION.md) for context
3. **Repository Purpose**: Read [02-REPOSITORY_PURPOSE.md](./02-REPOSITORY_PURPOSE.md) for architecture

### For Developers

```bash
# Add as submodule to your implementation repo
cd your-project
git submodule add <repo-url> context

# Import contracts
import { BookDTO } from './context/06-contracts/01-apis/rest/books.yaml'
```

---

## 📁 Repository Structure

```
bookshop-product-context/
├── README.md                     # This file
│
├── 01-source/                    # Original requirements (from docs/)
│
├── 02-domain/                    # Business knowledge
│   ├── 01-overview/              # Context, glossary
│   └── 03-business-rules/        # Validation rules
│
├── 03-backlog/                   # (removed — consolidated)
│
├── 04-architecture/              # System design
│   ├── 01-system-design/         # High-level architecture
│   └── 03-decisions/             # ADRs (Architecture Decision Records)
│
├── 05-modules/                   # Module specs
│   ├── 02-book-management/       # Book module
│   ├── 03-customer-management/   # Customer module
│   └── 04-order-management/      # Order module
│
└── 06-contracts/                 # THE GLUE 🔗
    ├── 01-apis/rest/             # OpenAPI 3.0 specs
    ├── 02-data-models/           # JSON schemas
    └── 03-events/                # Event schemas
```

**Simplified for personal project** - Only essential AI-DLC folders

---

## 🎯 Quick Navigation

### Start Here
1. [Business Rules](./02-domain/03-business-rules/) - What are the rules?
2. [API Contracts](./06-contracts/01-apis/) - How do systems talk?
3. [Module Specs](./05-modules/) - What does each module do?
4. [Module Specs](./05-modules/) - What does each module do?

### AI-DLC Pattern Learning
- **Domain** (02-domain/) = Business knowledge
- **Architecture** (04-architecture/) = How to structure
- **Modules** (05-modules/) = Component details
- **Contracts** (06-contracts/) = Integration interfaces

---

## 📊 Repository Status

| Section | Status | Files |
|---------|--------|-------|
| **01-source** | ✅ Complete | requirements.md (original) |
| **02-domain** | ✅ Complete | Glossary, 3 business rule files |
| **03-backlog** | — | Removed — consolidated into modules |
| **04-architecture** | ✅ Complete | System context (C4 L1) |
| **05-modules** | ✅ Complete | Book management spec |
| **06-contracts** | ✅ Complete | 3 OpenAPI specs, Event schemas |

**Total**: 3 API contracts | 3 business rule documents | 3 architecture docs

---

## 🎯 Start Implementing

Read **[IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)** for step-by-step instructions!

---

## 🧠 AI-DLC Pattern Explained

### The Core Concept
**Separate WHAT from HOW**

- **This repo** = WHAT (requirements, contracts, rules)
- **Implementation repos** = HOW (code, frameworks, deployment)

### Why This Matters
1. **AI Context Efficiency**: AI reads business context once, references it for all implementations
2. **Single Source of Truth**: All teams work from same requirements
3. **Contract-First**: Define interfaces before coding
4. **Reusability**: Same domain knowledge for backend, frontend, mobile

### Folder Mapping
- `02-domain/03-business-rules/` → Business validation logic
- `05-modules/` → What each module does
- `06-contracts/` → API specs that backend implements, frontend consumes

---

## 🔗 How to Use with Implementation

```bash
# In your backend/frontend repo
git submodule add ./bookshop-product-context context

# Import contracts
import { BookDTO } from '../context/06-contracts/01-apis/rest/books.yaml'
```

When implementing, reference:
1. Business rules from `02-domain/03-business-rules/`
2. API contract from `06-contracts/01-apis/`
3. Module spec from `05-modules/`

---

**Pattern**: AI-DLC (AI Development Lifecycle)  
**Purpose**: Learning structured development for personal project  
**Created**: June 2026
