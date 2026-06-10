# Stock Movement Business Rules

## Purpose
Validation rules for tracking and adjusting stock inventory.

---

## BR-STOCK-001: Stock Change Recording

**Rule**: Every stock change must be recorded with a valid reason

**Valid Reasons**:
- `order_deduction` — Stock reduced due to customer order
- `manual_restock` — Stock increased via manual restock
- `manual_adjustment` — Stock corrected manually
- `correction` — Error correction

---

## BR-STOCK-002: Stock Movement Immutability

**Rule**: Stock movement records are append-only and cannot be modified or deleted

---

## BR-STOCK-003: Manual Stock Adjustment

**Rule**: Manual adjustments must specify a valid reason and quantity delta

**Validation**:
- `newStock` must be >= 0
- Reason must be one of the valid enum values
- If reason is `order_deduction`, a `referenceId` (order ID) is required

---

**Last Updated**: June 2026
