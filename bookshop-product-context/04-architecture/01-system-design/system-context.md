# System Context (C4 Level 1)

## Purpose
High-level view of the Bookshop Management System and its interactions with users and external systems.

---

## System Overview

The **Bookshop Management System** is a comprehensive solution for managing bookshop operations including inventory, customers, and orders.

### System Boundary
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Bookshop Management System                      │
│                                                         │
│  • Book Inventory Management                            │
│  • Customer Records                                     │
│  • Order Processing                                     │
│  • Stock Tracking                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Actors (Users)

### Primary Users

#### 1. Bookshop Owner
- **Role**: Business owner and system administrator
- **Responsibilities**:
  - Oversee all operations
  - Configure system settings
  - Access all reports and analytics
  - Manage user accounts

#### 2. Store Manager
- **Role**: Daily operations manager
- **Responsibilities**:
  - Manage inventory (add, update, delete books)
  - Monitor stock levels
  - Review and process orders
  - Manage customer records

#### 3. Cashier/Sales Staff
- **Role**: Front-line sales and order processing
- **Responsibilities**:
  - Process customer orders
  - Update order status
  - Search for books
  - View customer information

#### 4. Inventory Staff
- **Role**: Stock management
- **Responsibilities**:
  - Update book records
  - Adjust stock quantities
  - Track inventory movements

---

## System Interactions

### User → System Interactions

```
┌────────────┐                    ┌──────────────────────┐
│            │  Manage Books      │                      │
│   Store    ├───────────────────►│                      │
│  Manager   │  Process Orders    │    Bookshop          │
│            │◄───────────────────┤    Management        │
└────────────┘  View Reports      │    System            │
                                  │                      │
┌────────────┐                    │                      │
│            │  Create Orders     │                      │
│  Cashier   ├───────────────────►│                      │
│            │  Search Books      │                      │
│            │◄───────────────────┤                      │
└────────────┘  Update Status     │                      │
                                  │                      │
┌────────────┐                    │                      │
│            │  View Dashboard    │                      │
│  Bookshop  ├───────────────────►│                      │
│   Owner    │  Generate Reports  │                      │
│            │◄───────────────────┤                      │
└────────────┘  Manage Users      └──────────────────────┘
```

---

## External Systems (Future)

### Phase 2 Integrations

#### 1. Payment Gateway
- **Purpose**: Process customer payments
- **Interaction**: System → Payment Gateway
- **Data**: Payment requests, transaction confirmations

#### 2. Shipping Provider
- **Purpose**: Track deliveries
- **Interaction**: System ↔ Shipping Provider
- **Data**: Shipping labels, tracking updates

#### 3. Supplier System
- **Purpose**: Automate restocking
- **Interaction**: System → Supplier System
- **Data**: Purchase orders, inventory updates

#### 4. Accounting System
- **Purpose**: Sync financial records
- **Interaction**: System → Accounting System
- **Data**: Sales transactions, inventory values

---

## Data Flow Overview

### Core Data Flow

```
1. Manager adds books to inventory
   ↓
2. Books available in system
   ↓
3. Customer places order (via Cashier)
   ↓
4. System validates stock availability
   ↓
5. Order created, stock deducted
   ↓
6. Staff updates order status (shipped → delivered)
```

---

## Key System Capabilities

### 1. Inventory Management
- Add, update, delete books
- Track stock levels in real-time
- Search and filter inventory
- Low stock alerts (future)

### 2. Customer Management
- Store customer information
- Track purchase history
- Quick customer lookup

### 3. Order Processing
- Create orders with validation
- Automatic stock deduction
- Order status tracking
- Order history

### 4. Reporting (Future)
- Sales analytics
- Inventory reports
- Customer insights
- Performance metrics

---

## System Boundaries

### In Scope (Phase 1)
- ✅ Book CRUD operations
- ✅ Customer records
- ✅ Order management
- ✅ Stock tracking
- ✅ Basic search

### Out of Scope (Phase 1)
- ❌ Payment processing
- ❌ Shipping integration
- ❌ Email notifications
- ❌ Advanced analytics
- ❌ Multi-store support

### Future Phases
- 📅 Payment gateway integration
- 📅 Shipping provider integration
- 📅 Email notifications
- 📅 Advanced reporting
- 📅 Mobile apps
- 📅 E-commerce website integration

---

## Technology Stack (High-Level)

### Frontend
- Web-based user interface
- Responsive design
- Modern JavaScript framework

### Backend
- RESTful API
- Database for persistence
- Business logic layer

### Infrastructure
- Cloud-hosted (AWS/Azure/GCP)
- Scalable architecture
- Secure data storage

---

## Non-Functional Characteristics

### Performance
- Response time < 1 second for searches
- Support concurrent users
- Fast order processing

### Security
- User authentication required
- Role-based access control
- Encrypted data storage
- Audit logging

### Availability
- 99% uptime target
- Regular backups
- Disaster recovery plan

### Scalability
- Handle growing inventory
- Support increasing order volume
- Add new stores/locations (future)

---

## Context Diagram

```
                    ┌─────────────────────────┐
                    │   Bookshop Owner        │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   Store Manager         │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
         ┌──────────│   Cashier/Staff         │
         │          └───────────┬─────────────┘
         │                      │
         │          ┌───────────▼─────────────┐
         │          │   Inventory Staff       │
         │          └───────────┬─────────────┘
         │                      │
         │          ┌───────────▼─────────────────────────┐
         │          │                                     │
         └─────────►│  Bookshop Management System         │
                    │                                     │
                    │  • Book Management                  │
                    │  • Customer Management              │
                    │  • Order Management                 │
                    │  • Inventory Tracking               │
                    │                                     │
                    └─────────────────────────────────────┘
```

---

## Related Documents

- [Container Diagram (C4 Level 2)](./container-diagram.md)
- [Architecture Principles](../00-overview/architecture-principles.md)
- [Deployment Architecture](../06-deployment/deployment-architecture.md)

---

**Architecture Level**: C4 Level 1 - System Context  
**Last Updated**: June 2026
