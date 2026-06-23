# SSL Commerz Payment Integration

## Overview

This document describes the SSL Commerz payment gateway integration for the Bookshop Management System. The integration handles the complete payment flow from checkout to payment confirmation.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend   │────▶│ SSL Commerz │────▶│  Backend (IPN)  │
│  (React)    │     │  (Express)  │     │   Gateway   │     │  (Callbacks)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────────┘
                           │                    │                    │
                           ▼                    ▼                    ▼
                      ┌─────────────────────────────────────────────────────┐
                      │                  PostgreSQL                         │
                      │  Orders • Payments • Audit Logs • Stock Movements  │
                      └─────────────────────────────────────────────────────┘
```

## Flow Diagram

```
User adds items to cart
        │
        ▼
User clicks "Checkout"
        │
        ▼
POST /api/v1/cart/checkout  ──▶ Creates checkout session
        │
        ▼
POST /api/v1/orders         ──▶ Creates order (status: pending)
        │
        ▼
POST /api/v1/payment/initiate ──▶ SSL Commerz session created
        │                              │
        │                              ▼
        │                       Returns gatewayPageURL
        │                              │
        ▼                              ▼
Frontend redirects to ──────────▶ SSL Commerz Payment Page
gatewayPageURL
        │                              │
        │         User completes payment
        │                              │
        ▼                              ▼
SSL Commerz callbacks ──────────▶ Backend endpoints:
  • /payment/success (redirect)      • /payment/fail (redirect)
  • /payment/cancel (redirect)       • /payment/ipn (server-to-server)
        │                              │
        ▼                              ▼
Order status updated:         Audit log created:
  • confirmed                • payment_confirmed
  • cancelled                • payment_failed
  • cancelled                • payment_cancelled
```

## API Endpoints

### Payment Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/initiate` | Initiate SSL Commerz payment session |
| POST | `/api/v1/payment/success` | SSL Commerz success callback (redirect) |
| POST | `/api/v1/payment/fail` | SSL Commerz failure callback (redirect) |
| POST | `/api/v1/payment/cancel` | SSL Commerz cancel callback (redirect) |
| POST | `/api/v1/payment/ipn` | SSL Commerz IPN (Instant Payment Notification) |
| GET | `/api/v1/payment/validate/:valId` | Manual payment validation |

### Request/Response Examples

#### Initiate Payment
```bash
POST /api/v1/payment/initiate
Content-Type: application/json

{
  "orderId": "uuid-of-order",
  "successUrl": "http://localhost:5173/payment/success",
  "failUrl": "http://localhost:5173/payment/failed",
  "cancelUrl": "http://localhost:5173/payment/cancelled",
  "ipnUrl": "http://localhost:3000/api/v1/payment/ipn"
}
```

**Success Response:**
```json
{
  "gatewayPageURL": "https://sandbox.sslcommerz.com/gwprocess/...",
  "sessionkey": "SESSION_KEY_FROM_SSLCOMMERZ"
}
```

**Error Response:**
```json
{
  "error": "Store Credential Error Or Store is De-active"
}
```

## Environment Variables

Add to `bookshop-backend/.env`:

```env
# SSL Commerz Configuration
SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASS=your_sandbox_store_password
SSLCOMMERZ_SANDBOX=true
SSLCOMMERZ_BASE_URL=http://localhost:3000

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### Getting Sandbox Credentials

1. Sign up at [sslcommerz.com](https://www.sslcommerz.com)
2. Go to **My Account** → **Sandbox Credentials**
3. Copy **Store ID** and **Store Password**
4. Set `SSLCOMMERZ_SANDBOX=true` for testing
5. For production: set `SSLCOMMERZ_SANDBOX=false` and use live credentials

## Database Changes

The integration uses existing tables:
- `orders` - status updated to `confirmed`/`cancelled`
- `audit_log` - payment events logged with `entityType: 'order'`, `action: 'updated'`

No new tables required.

## Frontend Integration

### Cart Checkout Flow

```typescript
// In CartContext.tsx
const handleCheckout = async (customerId: string) => {
  // 1. Validate cart & create checkout
  const checkoutResult = await cartApi.checkout({ customerId, items });
  
  // 2. Create order
  const order = await ordersApi.create({
    customerId,
    bookId: firstItem.bookId,
    quantity: firstItem.quantity
  });
  
  // 3. Initiate payment
  const paymentResult = await paymentApi.initiate({
    orderId: order.id,
    successUrl: `${FRONTEND_URL}/payment/success`,
    failUrl: `${FRONTEND_URL}/payment/failed`,
    cancelUrl: `${FRONTEND_URL}/payment/cancelled`,
    ipnUrl: `${API_URL}/payment/ipn`
  });
  
  // 4. Redirect to payment gateway
  window.location.href = paymentResult.gatewayPageURL;
};
```

### Payment Result Pages

Create these pages in your frontend:
- `/payment/success` - Show success message, redirect to orders
- `/payment/failed` - Show error, allow retry
- `/payment/cancelled` - Show cancellation message

## Testing

### Test Card Numbers (Sandbox)

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa | 4111 1111 1111 1111 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 5555 | 12/25 | 123 |
| Amex | 3782 8224 6310 005 | 12/25 | 1234 |

### Manual Testing Steps

1. Add items to cart
2. Click Checkout
3. Redirected to SSL Commerz sandbox
4. Use test card numbers above
5. Complete payment
6. Redirected to `/payment/success`
7. Verify order status = `confirmed` in dashboard

### API Testing

```bash
# 1. Create order
ORDER_ID=$(curl -s -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"...","bookId":"...","quantity":1}' | jq -r .id)

# 2. Initiate payment
curl -s -X POST http://localhost:3000/api/v1/payment/initiate \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\":\"$ORDER_ID\",
    \"successUrl\":\"http://localhost:5173/payment/success\",
    \"failUrl\":\"http://localhost:5173/payment/failed\",
    \"cancelUrl\":\"http://localhost:5173/payment/cancelled\",
    \"ipnUrl\":\"http://localhost:3000/api/v1/payment/ipn\"
  }"
```

## Security Considerations

- ✅ Store credentials in environment variables only
- ✅ IPN endpoint validates payment with SSL Commerz before updating order
- ✅ Amount validation: compares IPN amount with order total
- ✅ Transaction ID validation: matches order ID
- ✅ HTTPS required for production callbacks
- ✅ Never log store credentials or full card details

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `Store Credential Error` | Invalid sandbox credentials | Update `.env` with real credentials |
| `IPN validation failed` | Mismatched amount/order | Check order total matches payment amount |
| `Redirect not working` | Wrong callback URLs | Verify URLs in `.env` match deployment |
| `CORS error` | Frontend URL mismatch | Check `FRONTEND_URL` in backend `.env` |

## File Structure

```
bookshop-backend/
├── src/
│   ├── services/
│   │   └── payment.service.ts      # Core payment logic
│   ├── routes/
│   │   └── payment.routes.ts       # Payment endpoints
│   └── index.ts                    # Routes registered at /api/v1/payment

bookshop-frontend/
├── src/
│   ├── api/
│   │   ├── cart.api.ts             # checkout()
│   │   ├── orders.api.ts           # create()
│   │   └── payment.api.ts          # initiate()
│   └── context/
│       └── CartContext.tsx         # checkout() flow
```