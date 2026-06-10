# Glossary

## Purpose
Definitions of key terms and concepts used throughout the Bookshop Management System.

---

## Domain Terms

### Book
A physical or digital publication available for sale. Each book has:
- Title
- Author(s)
- Price
- Stock quantity

### Customer
An individual or organization that purchases books from the bookshop. Includes:
- Contact information
- Purchase history
- Account details

### Order
A transaction record representing a customer's purchase. Contains:
- Customer information
- Book(s) being purchased
- Quantity
- Status (pending, shipped, delivered)
- Total amount

### Stock/Inventory
The quantity of each book available for sale. Updated automatically when orders are placed.

### Order Status
The current state of an order in the fulfillment process:
- **Pending**: Order created, awaiting processing
- **Shipped**: Order dispatched to customer
- **Delivered**: Order received by customer

---

## System Terms

### CRUD
Create, Read, Update, Delete - basic data operations

### API
Application Programming Interface - how systems communicate

### DTO
Data Transfer Object - standardized data structure for API communication

### Validation
Process of ensuring data meets business rules before processing

---

## Business Rules Terms

### Stock Validation
Checking if sufficient inventory exists before allowing an order

### Stock Deduction
Reducing inventory quantity when an order is confirmed

### Negative Stock Prevention
Business rule preventing inventory from going below zero

### Partial Match Search
Finding books where title or author contains the search term

---

## User Roles

### Bookshop Owner
System administrator with full access to all features

### Store Manager
Day-to-day operations manager with access to inventory and order management

### Cashier/Sales Staff
Front-line staff processing customer orders

### Inventory Staff
Staff responsible for updating book records and stock levels

---

## Technical Terms

### REST API
Representational State Transfer - standard web API architecture

### OpenAPI
Standard specification format for REST APIs

### Event-Driven Architecture
System design where components communicate through events

### Contract
Agreed-upon interface specification between systems

---

## Acronyms

- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **DTO**: Data Transfer Object
- **ERD**: Entity Relationship Diagram
- **NFR**: Non-Functional Requirement
- **REST**: Representational State Transfer
- **UI**: User Interface
- **UX**: User Experience

---

**Last Updated**: June 2026
