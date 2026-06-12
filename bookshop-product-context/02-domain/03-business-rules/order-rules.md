# Order Management Business Rules

## Purpose
Validation rules and business logic for order processing and fulfillment.

---

## BR-ORDER-001: Stock Availability Validation

**Rule**: Orders can only be created if sufficient stock exists

**Validation**:
```
book.stock >= order.quantity
```

**Logic**:
1. Fetch book by bookId
2. Check if book exists
3. Compare available stock with requested quantity
4. If insufficient, reject order
5. If sufficient, proceed

**Errors**:
- "Book not found" (404 Not Found)
- "Insufficient stock available" (400 Bad Request)

**Example**:
```
Book: "Harry Potter", stock = 5
Order: quantity = 3 → ✅ Allowed
Order: quantity = 6 → ❌ Rejected (insufficient stock)
```

---

## BR-ORDER-002: Automatic Stock Deduction

**Rule**: Stock is automatically reduced when order is created

**Logic**:
1. Create order record
2. Reduce book.stock by order.quantity
3. Both operations must succeed (transactional)

**Formula**:
```
new_stock = current_stock - order_quantity
```

**Error Handling**:
- If stock update fails, rollback order creation
- Maintain data consistency

**Example**:
```
Before: Book stock = 10
Order: quantity = 3
After: Book stock = 7
```

---

## BR-ORDER-003: Prevent Negative Stock

**Rule**: Stock can never be negative

**Validation**:
```
book.stock - order.quantity >= 0
```

**Enforcement**:
- Validate before order creation (BR-ORDER-001)
- Database constraint to prevent negative values
- Double-check in transaction

---

## BR-ORDER-004: Order Status Workflow

**Rule**: Orders follow a defined status progression

**Valid Transitions**:
```
pending → confirmed → shipped → delivered → completed
                                        ↘ returned
```

**Invalid Transitions**:
- ❌ pending → shipped (skip confirmed)
- ❌ confirmed → delivered (skip shipped)
- ❌ delivered → pending/confirmed/shipped (reverse)
- ❌ completed → any (terminal state)
- ❌ returned → any (terminal state)

**Status Definitions**:
- **pending**: Order created, awaiting confirmation
- **confirmed**: Order confirmed, awaiting shipment
- **shipped**: Order dispatched, in transit
- **delivered**: Order received by customer
- **completed**: Order fully fulfilled (terminal success state)
- **cancelled**: Order cancelled before shipping (terminal)
- **returned**: Order returned by customer after delivery (terminal)

---

## BR-ORDER-005: Order Status Update Validation

**Rule**: Status updates must follow valid transitions

**Validation**:
1. Fetch current order status
2. Check if new status is valid next state
3. If invalid, reject with error
4. If valid, update status

**Errors**:
- "Order not found" (404)
- "Invalid status transition" (400)

**Examples**:
```
✅ pending → shipped
✅ shipped → delivered
❌ pending → delivered
❌ delivered → pending
```

---

## BR-ORDER-006: Required Order Fields

**Rule**: All orders must have customerId, bookId, and quantity

**Validation**:
- `customerId`: valid UUID/ID
- `bookId`: valid UUID/ID
- `quantity`: positive integer

**Errors**:
- "Missing required fields" (400)
- "Invalid quantity" (400)

---

## BR-ORDER-007: Minimum Order Quantity

**Rule**: Order quantity must be at least 1

**Validation**:
```
order.quantity >= 1
```

**Error**: "Quantity must be at least 1" (400 Bad Request)

---

## BR-ORDER-008: Stock Restoration on Cancellation

**Rule**: Stock is NOT restored on cancellation. Stock is only deducted at delivery, so cancelling before delivery has no stock impact.

**Current Behavior**:
- Cancellation only allowed from `pending` or `confirmed` (before stock deduction)
- No stock restoration needed because stock was never deducted

## BR-ORDER-011: Stock Restoration on Return

**Rule**: When a delivered order is returned, the book stock is restored

**Logic**:
1. Order must be in `delivered` status
2. User provides optional return reason
3. Stock is restored: `book.stock += order.quantity`
4. Stock movement logged with reason `return_restock`
5. Order status set to `returned`
6. Audit log entry created

**Formula**:
```
restored_stock = current_stock + returned_order_quantity
```

**Error Prevention**:
- Only `delivered` orders can be returned
- Transaction ensures atomicity of stock + status update
- Duplicate return prevented by status validation

---

## BR-ORDER-009: Order Modification Rules

**Rule** (Future): Orders can only be modified in pending status

**Current Behavior**: Status updates only

**Future Enhancement**:
- Allow quantity change if pending
- Re-validate stock availability
- Adjust stock accordingly
- Prevent changes after shipped

---

## BR-ORDER-010: Customer Validation

**Rule**: Customer must exist before order creation

**Validation**:
1. Check if customerId exists
2. If not found, reject order
3. If found, proceed

**Error**: "Customer not found" (404 Not Found)

---

## Order Processing Sequence

### Create Order Flow
```
1. Validate customer exists (BR-ORDER-010)
2. Validate book exists (BR-ORDER-001)
3. Validate quantity >= 1 (BR-ORDER-007)
4. Create order record (status = 'pending')
5. No stock deduction until delivery
6. Return order confirmation
```

### Update Status Flow
```
1. Fetch current order
2. Validate order exists
3. Validate status transition (BR-ORDER-005)
4. If transitioning to 'delivered':
   a. Check stock availability
   b. Deduct stock (BR-ORDER-002)
   c. Record stock movement
5. If transitioning to 'returned':
   a. Restore stock (BR-ORDER-011)
   b. Record return stock movement
6. Update status
7. Create audit log entry
8. Return updated order
```

---

## Error Response Examples

### Insufficient Stock (400)
```json
{
  "error": "Insufficient stock available",
  "details": {
    "bookId": "book-123",
    "requested": 5,
    "available": 2
  }
}
```

### Invalid Status Transition (400)
```json
{
  "error": "Invalid status transition",
  "details": {
    "currentStatus": "delivered",
    "requestedStatus": "pending",
    "message": "Cannot move from delivered to pending"
  }
}
```

---

## Related Business Rules

- **[Book Rules](./book-rules.md)**: Stock validation
- **[Customer Rules](./customer-rules.md)**: Customer validation

---

## Future Enhancements

1. **Partial Fulfillment**: Allow splitting orders if partial stock available
2. **Stock Reservation**: Reserve stock when order created, deduct when shipped
3. **Bulk Orders**: Validate bulk order stock across multiple books
4. **Pre-order**: Allow orders with zero stock, fulfill when stock arrives

---

**Last Updated**: June 2026
