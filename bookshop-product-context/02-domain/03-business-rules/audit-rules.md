# Audit Log Business Rules

## Purpose
Rules for immutable audit logging of all data changes.

---

## BR-AUDIT-001: Mandatory Auditing

**Rule**: Every create, update, and delete operation on books, customers, and orders must be logged

**Triggering Operations**:
- Book: created, updated, deleted
- Customer: created, updated, deleted
- Order: created, updated (status change)

---

## BR-AUDIT-002: Audit Log Immutability

**Rule**: Audit log entries are append-only and cannot be modified or deleted

---

## BR-AUDIT-003: Audit Entry Completeness

**Rule**: Each audit entry must capture:
- `entityType`: The type of entity (book, customer, order)
- `entityId`: UUID of the affected record
- `action`: created | updated | deleted
- `previousState`: Full JSON snapshot of the entity before the change (null for created)
- `newState`: Full JSON snapshot of the entity after the change (null for deleted)
- `performedBy`: User identifier (defaults to 'system' until auth is implemented)

---

**Last Updated**: June 2026
