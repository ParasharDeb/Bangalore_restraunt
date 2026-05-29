# AI Chef Order Flow - Quick Reference

## 🎯 The Flow in 30 Seconds

```
1. Customer adds pizza → POST /cart/add → Stored temporarily
2. Customer reviews cart → GET /cart/:sessionId → Shows total
3. Customer pays → POST /payment/intent → Gets Stripe secret
4. Payment completes → Stripe webhook → Auto-creates order + broadcasts
5. Kitchen dashboard → Receives order via WebSocket
6. Kitchen marks "Preparing" → PUT /orders/:id/preparing → Broadcasts update
7. Kitchen marks "Done" → PUT /orders/:id/complete → Customer sees update
```

---

## 📍 Endpoints at a Glance

### Cart (No Auth Needed)
```
POST   /cart/add              → Add item to cart
GET    /cart/:sessionId       → Get cart contents
DELETE /cart/remove           → Remove item
DELETE /cart/clear            → Clear entire cart
```

### Payment (No Auth Needed)
```
POST   /payment/intent        → Create Stripe payment intent
POST   /webhook/payment       → Stripe calls this automatically
```

### Orders (No Auth for GET /orders/:sessionId, Auth for others)
```
GET    /orders/:sessionId     → Get customer's orders
GET    /orders                → Get all orders (ADMIN)
PUT    /orders/:id/status     → Update order status (ADMIN)
PUT    /orders/:id/preparing  → Mark as preparing (ADMIN)
PUT    /orders/:id/complete   → Mark as completed (ADMIN)
```

---

## 🔌 WebSocket Events

### Connection
```javascript
socket.emit('register_session', 'user-123')
```

### Listen (Kitchen Dashboard)
```javascript
socket.on('new_order', (orderData) => {
  // { orderId, items, totalAmount, createdAt }
})

socket.on('order_status_updated', (update) => {
  // { orderId, status, updatedAt }
})
```

---

## 💾 Database Schemas

### Cart
```
sessionId (unique)
items: [
  { dishId, quantity, price }
]
expiresAt (auto-deletes in 24h)
```

### Order
```
orderId (unique, e.g., "ORD-1715999534521-a1b2c3d4")
sessionId
items: [
  { dishId, dishName, quantity, price }
]
totalAmount
status: "pending" | "confirmed" | "preparing" | "completed" | "cancelled"
paymentId (Stripe ID)
paymentStatus: "pending" | "completed" | "failed"
```

---

## 🚀 Frontend Hooks

### useCart
```typescript
const { cart, total, addToCart, removeFromCart, clearCart } = useCart('user-123')

addToCart('dishId', 2)      // Add 2 of this dish
removeFromCart('dishId')    // Remove this dish
clearCart()                 // Empty entire cart
```

### usePayment
```typescript
const { clientSecret, createPaymentIntent } = usePayment('user-123')

await createPaymentIntent(25.98)
// Use clientSecret with Stripe.js
```

### useOrders
```typescript
const { 
  orders, 
  markAsPreparing, 
  markAsCompleted 
} = useOrders('user-123', isAdmin: true)

markAsPreparing(orderId)   // Kitchen marks as preparing
markAsCompleted(orderId)   // Kitchen marks as completed
```

### useOrderUpdates
```typescript
const { newOrder, orderUpdate } = useOrderUpdates('user-123')

if (newOrder) {
  // New order received, show confirmation
}

if (orderUpdate) {
  // Order status changed, update UI
}
```

---

## 📋 Complete Request Examples

### 1. Add to Cart
```bash
curl -X POST http://localhost:8080/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user-123",
    "dishId": "DISH_ID",
    "quantity": 1
  }'
```

### 2. Get Cart
```bash
curl http://localhost:8080/cart/user-123
```

### 3. Create Payment Intent
```bash
curl -X POST http://localhost:8080/payment/intent \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user-123",
    "amount": 25.98
  }'
```

### 4. Mark Order as Preparing
```bash
curl -X PUT http://localhost:8080/orders/ORDER_ID/preparing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Mark Order as Completed
```bash
curl -X PUT http://localhost:8080/orders/ORDER_ID/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## ⚙️ Setup Checklist

- [ ] Run `pnpm install` in backend
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `DATABASE_URL` (MongoDB connection)
- [ ] Fill in `STRIPE_SECRET_KEY` (from Stripe dashboard)
- [ ] Setup Stripe webhook pointing to `/webhook/payment`
- [ ] Run `pnpm dev` to start backend on port 8080
- [ ] Import `useCart`, `usePayment`, etc. in React components
- [ ] Test cart flow end-to-end

---

## 🔑 Environment Variables

```
DATABASE_URL              → MongoDB connection string
JWT_SECRET               → Secret for JWT tokens (change in production)
STRIPE_SECRET_KEY        → Your Stripe secret key
STRIPE_WEBHOOK_SECRET    → Your Stripe webhook signing secret
NODE_ENV                 → "development" or "production"
```

---

## 🧪 Test the Complete Flow

1. **Add to cart**
   ```javascript
   const response = await fetch('/cart/add', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       sessionId: 'test-user-1',
       dishId: 'ACTUAL_DISH_ID',
       quantity: 2
     })
   });
   ```

2. **Get cart total**
   ```javascript
   const cart = await fetch('/cart/test-user-1').then(r => r.json());
   console.log('Total:', cart.total);  // $25.98
   ```

3. **Create payment**
   ```javascript
   const payment = await fetch('/payment/intent', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       sessionId: 'test-user-1',
       amount: 25.98
     })
   }).then(r => r.json());
   
   // Use payment.clientSecret with Stripe.js
   ```

4. **Complete Stripe payment** (in frontend)
   - Use `clientSecret` with Stripe Elements
   - Payment succeeds automatically

5. **Webhook fires** (automatic)
   - Order created
   - Cart cleared
   - WebSocket broadcasts to kitchen

6. **Check orders**
   ```javascript
   const orders = await fetch('/orders/test-user-1').then(r => r.json());
   console.log(orders);  // [{ orderId: 'ORD-...', status: 'confirmed', ... }]
   ```

---

## 🎨 UI Components Needed

### Customer Side
- [ ] Menu display with dishes
- [ ] Add to cart button
- [ ] Cart drawer/page with items and total
- [ ] Checkout button
- [ ] Stripe payment form (using @stripe/react-stripe-js)
- [ ] Order confirmation page
- [ ] Real-time order tracking (shows status updates)

### Admin/Kitchen Side
- [ ] Login page
- [ ] Kitchen dashboard
- [ ] Order cards showing items and total
- [ ] "Mark Preparing" button
- [ ] "Mark Completed" button
- [ ] Real-time order list updates (WebSocket)

---

## 🐛 Debugging Tips

### Check WebSocket Connection
```javascript
const socket = io('http://localhost:8080');
socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
```

### Monitor Orders
```javascript
const orders = await fetch('/orders/test-user-1').then(r => r.json());
console.log(orders);  // Should show all orders
```

### Test Stripe Webhook Locally
```bash
stripe listen --forward-to localhost:8080/webhook/payment
```

### Check MongoDB Orders
```
db.orders.find({}).pretty()
db.carts.find({}).pretty()
```

---

## 📊 Expected Response Times

| Endpoint | Typical Time |
|----------|--------------|
| /cart/add | 50-100ms |
| /cart/:id | 30-50ms |
| /payment/intent | 200-300ms (Stripe API) |
| /orders/:id/preparing | 50-100ms |
| WebSocket update | <50ms |

---

## 🔒 Security Notes

✅ Already implemented:
- JWT auth on admin endpoints
- Stripe webhook signature verification
- Cart auto-expiration (24h)
- Session isolation

⚠️ Still needed:
- Rate limiting
- Request validation
- HTTPS in production
- CORS whitelist

---

## 📞 Support

### Common Issues

**Q: Webhook not being called**
A: Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard. Use `stripe listen` for local testing.

**Q: Orders not updating in real-time**
A: Verify WebSocket connection: `socket.emit('register_session', sessionId)`

**Q: Payment intent fails**
A: Check STRIPE_SECRET_KEY is correct. Verify amount is in cents (multiply by 100).

**Q: Cart is empty after payment**
A: This is correct! Webhook clears cart after creating order.

---

Generated from: Implementation Summary
Last Updated: May 17, 2024
