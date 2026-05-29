# AI Chef - Complete Order Flow API Documentation

## Overview
This backend implements a complete order-to-kitchen flow with real-time updates, payment processing via Stripe, and WebSocket support for live order tracking.

## Architecture

```
Customer → Cart Management → Payment Processing → Order Creation → Kitchen Updates
     ↓            ↓                  ↓                   ↓               ↓
   React       Store items      Stripe verify       MongoDB        WebSocket
  Frontend     temporarily      via webhook         persist         broadcast
```

## 1. Cart Management

### Add Item to Cart
**Endpoint:** `POST /cart/add`

**Request:**
```json
{
  "sessionId": "user-session-123",
  "dishId": "dish-objectid-123",
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cart": {
    "_id": "...",
    "sessionId": "user-session-123",
    "items": [
      {
        "dishId": "dish-objectid-123",
        "quantity": 2,
        "price": 12.99
      }
    ],
    "expiresAt": "2024-05-18T10:00:00Z"
  }
}
```

### Get Cart
**Endpoint:** `GET /cart/:sessionId`

**Response:**
```json
{
  "cart": {
    "items": [
      {
        "dishId": { "name": "Pizza", "price": 12.99, ... },
        "quantity": 2,
        "price": 12.99
      }
    ]
  },
  "total": 25.98
}
```

### Remove Item from Cart
**Endpoint:** `DELETE /cart/remove`

**Request:**
```json
{
  "sessionId": "user-session-123",
  "dishId": "dish-objectid-123"
}
```

### Clear Cart
**Endpoint:** `DELETE /cart/clear`

**Request:**
```json
{
  "sessionId": "user-session-123"
}
```

---

## 2. Payment Processing

### Create Payment Intent
**Endpoint:** `POST /payment/intent`

**Request:**
```json
{
  "sessionId": "user-session-123",
  "amount": 25.98
}
```

**Response:**
```json
{
  "clientSecret": "pi_12345_secret_67890",
  "paymentIntentId": "pi_12345"
}
```

Pass the `clientSecret` to Stripe's client-side payment element.

### Webhook Handler
**Endpoint:** `POST /webhook/payment`

This endpoint is automatically called by Stripe when payment succeeds. It:
1. Verifies the webhook signature
2. Confirms `payment_intent.succeeded` event
3. Creates order in MongoDB
4. Clears the cart
5. **Broadcasts real-time update to kitchen via WebSocket**

---

## 3. Order Management

### Create Payment Intent (Frontend handles Stripe)
After customer completes payment, Stripe calls the webhook which creates the order automatically.

### Get Orders for Session
**Endpoint:** `GET /orders/:sessionId`

**Response:**
```json
{
  "orders": [
    {
      "_id": "...",
      "orderId": "ORD-1715999534521-a1b2c3d4",
      "sessionId": "user-session-123",
      "items": [
        {
          "dishName": "Pepperoni Pizza",
          "quantity": 2,
          "price": 12.99
        }
      ],
      "totalAmount": 25.98,
      "status": "pending",
      "paymentStatus": "completed",
      "createdAt": "2024-05-18T09:00:00Z"
    }
  ]
}
```

### Get All Orders (Admin)
**Endpoint:** `GET /orders`
**Auth:** Requires JWT token
**Response:** Same structure as above, all orders across all sessions

### Update Order Status
**Endpoint:** `PUT /orders/:orderId/status`
**Auth:** Requires JWT token

**Request:**
```json
{
  "status": "preparing"
}
```

Valid statuses: `pending`, `confirmed`, `preparing`, `completed`, `cancelled`

### Mark Order as Preparing
**Endpoint:** `PUT /orders/:orderId/preparing`
**Auth:** Requires JWT token

### Mark Order as Completed
**Endpoint:** `PUT /orders/:orderId/complete`
**Auth:** Requires JWT token

---

## 4. Real-Time Updates via WebSocket

### Connection Flow

1. **Frontend Connects:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080');
socket.emit('register_session', 'user-session-123');
```

2. **Listen for New Orders (Kitchen Dashboard):**
```javascript
socket.on('new_order', (orderData) => {
  console.log('Order #' + orderData.orderId);
  console.log('Items:', orderData.items);
  // Update kitchen display
});
```

3. **Listen for Status Updates:**
```javascript
socket.on('order_status_updated', (statusUpdate) => {
  console.log('Order ' + statusUpdate.orderId + ' is now ' + statusUpdate.status);
  // Update customer display
});
```

---

## 5. Data Models

### Cart Schema
```typescript
{
  sessionId: String (unique, required),
  items: [
    {
      dishId: ObjectId (ref: Dish),
      quantity: Number,
      price: Number
    }
  ],
  createdAt: Date,
  expiresAt: Date (auto-expires in 24 hours)
}
```

### Order Schema
```typescript
{
  orderId: String (unique, e.g., "ORD-1715999534521-a1b2c3d4"),
  sessionId: String (required),
  items: [
    {
      dishId: ObjectId,
      dishName: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: String (enum: pending, confirmed, preparing, completed, cancelled),
  paymentId: String (Stripe payment intent ID),
  paymentStatus: String (enum: pending, completed, failed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. Complete Flow Example

### Step 1: Customer Adds Items to Cart
```bash
POST /cart/add
{
  "sessionId": "user-123",
  "dishId": "dish-1",
  "quantity": 1
}
```

### Step 2: Get Cart Total
```bash
GET /cart/user-123
```

### Step 3: Create Payment Intent
```bash
POST /payment/intent
{
  "sessionId": "user-123",
  "amount": 25.98
}
```

### Step 4: Complete Payment (Frontend)
- Use Stripe.js to complete payment with clientSecret

### Step 5: Stripe Webhook (Automatic)
- Stripe calls `POST /webhook/payment`
- Order created in MongoDB
- Cart cleared
- WebSocket broadcast to kitchen: `new_order` event

### Step 6: Kitchen Dashboard Receives Order
- WebSocket event: Order #124 with 2 burgers and 1 coke

### Step 7: Kitchen Updates Status
```bash
PUT /orders/:orderId/preparing
(Order marked as "Preparing")

PUT /orders/:orderId/complete
(Order marked as "Completed")
```

### Step 8: Real-Time Updates
- Customer sees order status changes via WebSocket
- Admin dashboard updates in real-time

---

## Environment Setup

1. **Install Dependencies:**
```bash
cd apps/backend
pnpm install
```

2. **Setup .env File:**
```bash
cp .env.example .env
# Fill in your Stripe keys and MongoDB URL
```

3. **Stripe Setup:**
- Get API keys from https://dashboard.stripe.com
- Setup webhook in Stripe dashboard pointing to `POST /webhook/payment`
- Webhook events to listen: `payment_intent.succeeded`

4. **Run Backend:**
```bash
pnpm dev
```

---

## Security Notes

- All admin endpoints require JWT authentication
- Cart automatically expires after 24 hours
- Payment webhook verifies Stripe signature
- Session IDs should be unique per user/session
- Store JWT_SECRET securely in production
- Use HTTPS in production for payment security

---

## Frontend Integration Example

```typescript
// Add to cart
const addToCart = async (dishId: string) => {
  const res = await fetch('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: 'user-123',
      dishId,
      quantity: 1
    })
  });
};

// Connect WebSocket for real-time updates
const socket = io('http://localhost:8080');
socket.emit('register_session', 'user-123');

socket.on('new_order', (order) => {
  console.log('Order received:', order);
});

socket.on('order_status_updated', (update) => {
  console.log('Order status:', update.status);
});
```
