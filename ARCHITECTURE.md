# AI Chef - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Menu Page    │    │ Cart Page    │    │ Checkout     │     │
│  │ (Browse)     │───→│ (Review)     │───→│ (Stripe)     │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                    │              │
│         │ HTTP              │ HTTP               │ WebSocket    │
│         └───────────────────┴────────────────────┴──────────┐   │
│                                                             │   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  React + Socket.IO                                       │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ useCart                                             │ │ │
│  │  │ usePayment                                          │ │ │
│  │  │ useOrders                                           │ │ │
│  │  │ useOrderUpdates (WebSocket)                         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┬──────────────┐
                 │                        │              │
                 ▼                        ▼              ▼
        ┌──────────────────┐     ┌──────────────┐  ┌──────────────┐
        │  HTTP Requests   │     │ WebSocket    │  │ Stripe       │
        │  (REST API)      │     │ Events       │  │ Payment      │
        └──────────────────┘     └──────────────┘  └──────────────┘
                 │                        │              │
                 └────────────┬────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express + Socket.IO)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ HTTP Server (Port 8080)                               │   │
│  │                                                        │   │
│  │ Cart Endpoints                                         │   │
│  │ ├─ POST   /cart/add                                   │   │
│  │ ├─ GET    /cart/:sessionId                            │   │
│  │ ├─ DELETE /cart/remove                                │   │
│  │ └─ DELETE /cart/clear                                 │   │
│  │                                                        │   │
│  │ Payment Endpoints                                      │   │
│  │ ├─ POST /payment/intent         (Create Stripe PI)   │   │
│  │ └─ POST /webhook/payment        (Stripe callback)    │   │
│  │                                                        │   │
│  │ Order Endpoints                                        │   │
│  │ ├─ GET    /orders/:sessionId                          │   │
│  │ ├─ GET    /orders               (Admin)               │   │
│  │ ├─ PUT    /orders/:id/status    (Admin)               │   │
│  │ ├─ PUT    /orders/:id/preparing (Admin)               │   │
│  │ └─ PUT    /orders/:id/complete  (Admin)               │   │
│  │                                                        │   │
│  │ Auth Endpoints                                         │   │
│  │ ├─ POST /admin/signup                                 │   │
│  │ └─ POST /admin                  (Login)               │   │
│  │                                                        │   │
│  │ Menu Endpoints                                         │   │
│  │ ├─ POST /newitem                (Admin)               │   │
│  │ ├─ PUT  /change-item            (Admin)               │   │
│  │ └─ GET  /items                                        │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ WebSocket Server (Socket.IO)                           │   │
│  │                                                        │   │
│  │ Events:                                                │   │
│  │ ├─ register_session           (from client)           │   │
│  │ ├─ new_order                  (to kitchen)            │   │
│  │ └─ order_status_updated       (to all clients)        │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  MongoDB     │ │  Stripe API  │ │  (Future)    │
        │  - carts     │ │  - Payments  │ │  - Email     │
        │  - orders    │ │  - Webhook   │ │  - SMS       │
        │  - dishes    │ │  - Signature │ │              │
        │  - admins    │ │    Verify    │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Complete Request Flow

```
CUSTOMER ADDS PIZZA TO CART
═══════════════════════════════════════════════════════════════════

Customer clicks "Add to Cart" (quantity: 1)
         │
         ▼
Frontend: addToCart(dishId='PIZZA123', quantity=1)
         │
         ├─ sessionId: 'user-abc123'
         │
         ▼
POST /cart/add
{
  "sessionId": "user-abc123",
  "dishId": "PIZZA123",
  "quantity": 1
}
         │
         ▼
Backend: Verify dishId exists in dishModel
         │
         ▼
Find or create cart with sessionId='user-abc123'
         │
         ├─ If exists: Add item to items array
         │
         ├─ If new: Create cart with items
         │
         ▼
Save to MongoDB: collection 'carts'
         │
         ▼
Response:
{
  "message": "Item added to cart",
  "cart": {
    "sessionId": "user-abc123",
    "items": [
      {
        "dishId": "PIZZA123",
        "quantity": 1,
        "price": 12.99
      }
    ],
    "expiresAt": "2024-05-19T10:00:00Z"
  }
}
         │
         ▼
Frontend: Update UI, show "1 item in cart"
```

---

## Payment & Order Creation Flow

```
CUSTOMER PAYS & ORDER CREATED
═══════════════════════════════════════════════════════════════════

Customer clicks "Checkout"
         │
         ▼
Frontend: createPaymentIntent(sessionId='user-abc123', amount=25.98)
         │
         ▼
POST /payment/intent
{
  "sessionId": "user-abc123",
  "amount": 25.98
}
         │
         ▼
Backend: Call Stripe API
         stripe.paymentIntents.create({
           amount: 2598 (in cents),
           currency: 'usd',
           metadata: { sessionId: 'user-abc123' }
         })
         │
         ▼
Response:
{
  "clientSecret": "pi_12345_secret_67890",
  "paymentIntentId": "pi_12345"
}
         │
         ▼
Frontend: Pass clientSecret to Stripe Elements
         Customer enters card details
         │
         ▼
Stripe Payment Form: Validates & processes payment
         │
         ▼
Payment succeeds! ✓
         │
         ▼
Stripe: Sends webhook to backend
POST /webhook/payment
         │
         ├─ Verify Stripe signature ✓
         │
         ▼
Extract sessionId from payment metadata
         │
         ▼
Fetch cart from MongoDB where sessionId='user-abc123'
         │
         ▼
Create new Order:
{
  "orderId": "ORD-1715999534521-a1b2c3d4",
  "sessionId": "user-abc123",
  "items": [
    {
      "dishId": "PIZZA123",
      "dishName": "Pepperoni Pizza",
      "quantity": 1,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "status": "confirmed",
  "paymentId": "pi_12345",
  "paymentStatus": "completed"
}
         │
         ▼
Save Order to MongoDB: collection 'orders'
         │
         ▼
Delete Cart from MongoDB
         │
         ▼
Broadcast via WebSocket to ALL connected clients:
{
  "event": "new_order",
  "data": {
    "orderId": "ORD-1715999534521-a1b2c3d4",
    "items": [{ "dishName": "Pepperoni Pizza", ... }],
    "totalAmount": 25.98,
    "createdAt": "2024-05-18T10:00:00Z"
  }
}
         │
         ▼
Kitchen Dashboard receives WebSocket event
         │
         ├─ Display new order card
         ├─ Show: Order #ORD-1715999534521-a1b2c3d4
         ├─ Show: 1x Pepperoni Pizza ($12.99)
         └─ Show: Total $25.98
         │
         ▼
Customer's browser receives order confirmation
         │
         └─ Show: "Order received! Order #ORD-1715999534521-a1b2c3d4"
```

---

## Kitchen Dashboard Status Update Flow

```
KITCHEN MARKS ORDER AS PREPARING
═══════════════════════════════════════════════════════════════════

Admin/Kitchen sees Order #ORD-1715999534521-a1b2c3d4
         │
         ▼
Clicks "Mark as Preparing" button
         │
         ▼
Frontend: markAsPreparing(orderId='...')
         │
         ▼
PUT /orders/ORDERID/preparing
Authorization: Bearer JWT_TOKEN
         │
         ▼
Backend: Verify JWT token ✓
         │
         ▼
Find Order by _id in MongoDB
         │
         ▼
Update order:
{
  "status": "preparing",
  "updatedAt": "2024-05-18T10:05:00Z"
}
         │
         ▼
Save to MongoDB
         │
         ▼
Broadcast via WebSocket to ALL connected clients:
{
  "event": "order_status_updated",
  "data": {
    "orderId": "ORD-1715999534521-a1b2c3d4",
    "status": "preparing",
    "updatedAt": "2024-05-18T10:05:00Z"
  }
}
         │
         ▼
Kitchen Dashboard updates:
         └─ Order status changes to "PREPARING"
         │
         ▼
Customer's browser receives update:
         └─ Shows "Your order is being prepared..."
         └─ Timestamp updates


KITCHEN MARKS ORDER AS COMPLETED
═══════════════════════════════════════════════════════════════════

Admin/Kitchen clicks "Mark as Completed"
         │
         ▼
PUT /orders/ORDERID/complete
Authorization: Bearer JWT_TOKEN
         │
         ▼
Update order to status="completed"
         │
         ▼
Broadcast to ALL clients:
{
  "orderId": "ORD-1715999534521-a1b2c3d4",
  "status": "completed"
}
         │
         ▼
Kitchen Dashboard: Order moves to "Completed" section
Customer: Shows "Your order is ready for pickup!"
```

---

## Data Dependencies

```
┌────────────────┐
│   Admin Auth   │
│ (username:pwd) │
└────────────────┘
         │
         ▼
    ┌─────────┐
    │  Admin  │ ◄─── Admin login, manage menu
    └─────────┘
         │
         ▼
    ┌──────────────┐
    │    Dishes    │ ◄─── Menu items with prices
    └──────────────┘
         ▲
         │
    ┌────┴─────┐
    │           │
┌───┴────┐ ┌───┴────┐
│  Carts │ │ Orders │
│ (temp) │ │ (perm) │
└────────┘ └────────┘
    │           │
    └─────┬─────┘
          │
    ┌─────▼─────────────┐
    │ Session (customer) │
    └───────────────────┘
```

---

## WebSocket Connection Lifecycle

```
Customer Opens Order Tracking Page
         │
         ▼
Frontend code runs:
const socket = io('http://localhost:8080');
         │
         ▼
socket.emit('register_session', 'user-abc123');
         │
         ▼
Backend:
socket.on('register_session', (sessionId) => {
  connectedClients.set(sessionId, socket.id);
  socket.join(`kitchen-${sessionId}`);
})
         │
         ▼
Connection established ✓
         │
         ├─ Listen: 'new_order'
         ├─ Listen: 'order_status_updated'
         │
         ▼
[Waiting for events...]
         │
         ├─ Order placed: Broadcast 'new_order' → update UI
         ├─ Status changes: Broadcast 'order_status_updated' → update UI
         │
         ▼
Customer closes page / disconnects
         │
         ▼
Backend:
socket.on('disconnect', () => {
  // Remove from connectedClients map
})
         │
         ▼
Connection closed ✓
```

---

## Database Schema Relationships

```
                ┌─────────────────────┐
                │     admin (Auth)    │
                │ name, password      │
                └─────────────────────┘

┌──────────────────────────────────────────────┐
│                    Dish                      │
│ name, category, description, price, image   │
│ available (boolean)                         │
└──────────────────────────────────────────────┘
       ▲                        ▲
       │                        │
  ┌────┴────────┐           ┌───┴─────────┐
  │             │           │             │
  │ Referenced  │           │ Referenced  │
  │ by: Cart    │           │ by: Order   │
  │             │           │             │
  └─────────────┘           └─────────────┘
       │                        │
       ▼                        ▼
┌─────────────────┐      ┌─────────────────────────────┐
│      Cart       │      │         Order               │
│ sessionId (TTL) │      │ orderId (unique)            │
│ items[]         │      │ sessionId (reference)       │
│ expiresAt       │      │ items[] (details captured)  │
│ createdAt       │      │ totalAmount                 │
└─────────────────┘      │ status (enum)               │
                         │ paymentId (Stripe ref)      │
                         │ paymentStatus               │
                         │ createdAt, updatedAt        │
                         └─────────────────────────────┘
```

---

## Error Handling & Edge Cases

```
ADD TO CART ERROR CASES
═══════════════════════════════════════════════════════════════════

1. Missing fields:
   {"error": "sessionId, dishId, and quantity are required"}

2. Dish not found:
   {"error": "Dish not found"}

3. Database error:
   {"error": "Server error"}


PAYMENT WEBHOOK ERROR CASES
═══════════════════════════════════════════════════════════════════

1. Bad signature:
   {"error": "Webhook signature verification failed"}

2. Wrong event type:
   (Process silently, no error)

3. Cart expired:
   Order created but cart already deleted
   (Order still persists, webhook still succeeds)


ORDER UPDATE ERROR CASES
═══════════════════════════════════════════════════════════════════

1. Missing JWT:
   {"error": "No token provided"}

2. Invalid JWT:
   {"error": "Invalid token"}

3. Order not found:
   {"error": "Order not found"}

4. Invalid status:
   {"error": "Invalid status"}
```

---

Generated from: Architecture Documentation
Visual Format: ASCII Diagrams
Last Updated: May 17, 2024
