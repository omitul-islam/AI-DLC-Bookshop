# Customer Management Business Rules

## Purpose
Validation rules and business logic for customer management operations.

---

## BR-CUSTOMER-001: Required Fields

**Rule**: All customers must have name, email, and phone

**Validation**:
- `name`: non-empty string
- `email`: non-empty string, valid email format
- `phone`: non-empty string, valid phone format

**Error**: "Missing required fields" (400 Bad Request)

---

## BR-CUSTOMER-002: Email Format Validation

**Rule**: Email must be valid format

**Validation**:
```
- Contains @ symbol
- Has domain part after @
- Valid TLD (top-level domain)
```

**Error**: "Invalid email format" (400 Bad Request)

**Examples**:
- ✅ Valid: "user@example.com", "name.surname@domain.co.uk"
- ❌ Invalid: "userexample.com", "@example.com", "user@"

---

## BR-CUSTOMER-003: Email Uniqueness

**Rule**: Email must be unique across all customers

**Validation**:
```
Check if email already exists in database
```

**Error**: "Email is already registered" (400 Bad Request)

**Note**: Email is case-insensitive for uniqueness check

---

## BR-CUSTOMER-004: Phone Format Validation

**Rule**: Phone number must be valid format

**Validation**:
- Accepts various formats
- Optional country code
- Digits, dashes, spaces, parentheses allowed
- Minimum 10 digits

**Error**: "Invalid phone number format" (400 Bad Request)

**Examples**:
- ✅ Valid: "+1-555-123-4567", "(555) 123-4567", "5551234567"
- ❌ Invalid: "123", "abc-defg-hijk"

---

## BR-CUSTOMER-005: Name Validation

**Rule**: Name must be non-empty string

**Validation**:
```
name.trim().length > 0
name.length <= 100
```

**Error**: "Name is required" or "Name too long" (400 Bad Request)

---

## BR-CUSTOMER-006: Address Validation

**Rule**: Address is optional but if provided must be non-empty

**Validation**:
- Can be null or undefined
- If provided, must be non-empty string
- Maximum length: 500 characters

**Error**: "Invalid address format" (400 Bad Request)

---

## BR-CUSTOMER-007: Update Validation

**Rule**: When updating customer, validate changed fields only

**Logic**:
1. Fetch existing customer
2. Merge provided fields with existing values
3. Validate merged result
4. Check email uniqueness if email changed

**Error**: 
- "Customer not found" (404 Not Found)
- Field-specific validation errors (400 Bad Request)

---

## BR-CUSTOMER-008: Delete Validation

**Rule**: Customer must exist before deletion

**Logic**:
1. Check if customer exists
2. If not found, return error
3. If found, delete record

**Error**: "Customer not found" (404 Not Found)

**Future**: Check for active orders before deletion

---

## Validation Priority

1. **Required fields** (BR-CUSTOMER-001)
2. **Field formats** (email, phone, name)
3. **Uniqueness checks** (email)
4. **Existence checks** (for update/delete)

---

## Error Response Examples

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Email is already registered",
    "phone": "Invalid phone number format"
  }
}
```

### Not Found (404)
```json
{
  "error": "Customer not found",
  "customerId": "customer-123"
}
```

---

## Related Business Rules

- **[Order Rules](./order-rules.md)**: Customer validation for orders

---

## Future Enhancements

1. **Customer Tiers**: VIP, Regular, New customer categories
2. **Credit Limit**: Maximum outstanding order amount
3. **Blacklist**: Prevent orders from certain customers
4. **Customer History**: Track total purchases, last order date
5. **Email Verification**: Verify email before first order

---

**Last Updated**: June 2026
