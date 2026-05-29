import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB, adminModel, dishModel, cartModel, orderModel } from "../../database/dist/index.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import cors from 'cors'
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy')

// Store connected clients for broadcasting updates
const connectedClients: Map<string, string> = new Map(); // sessionId -> socketId

// WebSocket connections
io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    socket.on('register_session', (sessionId: string) => {
        connectedClients.set(sessionId, socket.id);
        socket.join(`kitchen-${sessionId}`);
        console.log(`Session ${sessionId} registered for real-time updates`);
    });

    socket.on('disconnect', () => {
        connectedClients.forEach((socketId, sessionId) => {
            if (socketId === socket.id) {
                connectedClients.delete(sessionId);
            }
        });
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ==================== AUTH ENDPOINTS ====================

// Admin signup endpoint
app.post("/admin/signup", async (req, res) => {
    try {
        await connectDB();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ name: username });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new admin
        const newAdmin = new adminModel({
            name: username,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin login endpoint
app.post("/admin", async (req, res) => {
    try {
        await connectDB();
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const admin = await adminModel.findOne({ name: username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcryptjs.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, username: admin.name }, JWT_SECRET);
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== MENU ENDPOINTS ====================

// Add new item endpoint
app.post("/newitem", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { name, price, image, description, category, available } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ error: 'Name, price, and image are required' });
        }

        const newDish = new dishModel({
            name,
            price,
            image,
            category,
            available: available !== false,
            description: description || ''
        });

        await newDish.save();
        
        // Broadcast to all clients for real-time updates
        io.emit('menu_item_added', newDish);
        
        res.status(201).json({ message: 'Item added successfully', dish: newDish });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update item endpoint
app.put("/change-item", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { id, name, price, image, description, category, available } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (price) updateData.price = price;
        if (image) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (available !== undefined) updateData.available = available;

        const updatedDish = await dishModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedDish) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Broadcast to all clients for real-time updates
        io.emit('menu_item_updated', updatedDish);
        
        res.json({ message: 'Item updated successfully', dish: updatedDish });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete item endpoint
app.delete("/items/:id", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;

        const deletedDish = await dishModel.findByIdAndDelete(id);
        
        if (!deletedDish) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Broadcast to all clients for real-time updates
        io.emit('menu_item_deleted', { id });
        
        res.json({ message: 'Item deleted successfully', dish: deletedDish });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all items endpoint
app.get("/items", async (req, res) => {
    try {
        await connectDB();
        const items = await dishModel.find();
        res.json({ items });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== CART ENDPOINTS ====================

// Add item to cart endpoint
app.post("/cart/add", async (req, res) => {
    try {
        await connectDB();
        const { sessionId, dishId, quantity } = req.body;

        if (!sessionId || !dishId || !quantity) {
            return res.status(400).json({ error: 'sessionId, dishId, and quantity are required' });
        }

        // Get dish details
        const dish = await dishModel.findById(dishId);
        if (!dish) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        // Find or create cart
        let cart = await cartModel.findOne({ sessionId });
        
        if (!cart) {
            cart = new cartModel({
                sessionId,
                items: [{
                    dishId,
                    quantity,
                    price: dish.price
                }]
            });
        } else {
            // Check if item already in cart
            const existingItem = cart.items.find((item: any) => item.dishId.toString() === dishId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    dishId,
                    quantity,
                    price: dish.price
                });
            }
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get cart endpoint
app.get("/cart/:sessionId", async (req, res) => {
    try {
        await connectDB();
        const { sessionId } = req.params;

        const cart = await cartModel.findOne({ sessionId }).populate('items.dishId');
        
        if (!cart) {
            return res.status(200).json({
                message: 'Cart is empty',
                cart: { sessionId, items: [] },
                items: [],
                total: 0,
            });
        }

        const total = cart.items.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);

        res.json({ cart, total });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove item from cart endpoint
// Remove item from cart endpoint
app.delete("/cart/remove", async (req, res) => {
    try {
        await connectDB();

        const { sessionId, dishId } = req.body;

        if (!sessionId || !dishId) {
            return res.status(400).json({
                error: "sessionId and dishId are required"
            });
        }

        const cart = await cartModel.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }

        // Find item index
        const index = cart.items.findIndex(
            (item: any) =>
                item.dishId.toString() === dishId
        );

        // Remove item safely from mongoose DocumentArray
        if (index !== -1) {
            cart.items.splice(index, 1);
        }

        // If cart becomes empty, delete it
        if (cart.items.length === 0) {
            await cartModel.deleteOne({ sessionId });

            return res.json({
                message: "Item removed, cart is now empty"
            });
        }

        await cart.save();

        res.json({
            message: "Item removed from cart",
            cart
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

// Clear cart endpoint
app.delete("/cart/clear", async (req, res) => {
    try {
        await connectDB();
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        await cartModel.deleteOne({ sessionId });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PAYMENT ENDPOINTS ====================

// Create payment intent endpoint (amount = total in INR rupees)
app.post("/payment/intent", async (req, res) => {
    try {
        await connectDB();
        const { sessionId, amount } = req.body;

        if (!sessionId || amount == null) {
            return res.status(400).json({ error: 'sessionId and amount are required' });
        }

        const amountInPaise = Math.round(Number(amount) * 100);
        if (amountInPaise < 50) {
            return res.status(400).json({ error: 'Amount is too small' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: 'inr',
            metadata: { sessionId },
            automatic_payment_methods: { enabled: true },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: 'Payment intent creation failed' });
    }
});

// Verify payment webhook endpoint
app.post("/webhook/payment", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        await connectDB();
        const sig = req.headers['stripe-signature'] as string;
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as any;
            const sessionId = paymentIntent.metadata.sessionId;

            // Get cart with populated dish names
            const cart = await cartModel.findOne({ sessionId }).populate('items.dishId');
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            // Create order with proper dish names
            const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const order = new orderModel({
                orderId,
                sessionId,
                items: cart.items.map((item: any) => ({
                    dishId: item.dishId._id,
                    dishName: item.dishId.name || `Dish`,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
                paymentId: paymentIntent.id,
                paymentStatus: 'completed',
                status: 'confirmed'
            });

            await order.save();

            // Clear cart
            await cartModel.deleteOne({ sessionId });

            // Broadcast new order to all admin clients
            io.emit('new_order', {
                _id: order._id,
                orderId: order.orderId,
                items: order.items,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                status: order.status
            });

            res.json({ message: 'Payment verified and order created', order });
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook signature verification failed' });
    }
});

// ==================== ORDER ENDPOINTS ====================

// Get orders for session
app.get("/orders/:sessionId", async (req, res) => {
    try {
        await connectDB();
        const { sessionId } = req.params;

        const orders = await orderModel.find({ sessionId }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all orders (for admin kitchen dashboard)
app.get("/orders", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const orders = await orderModel.find().sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status endpoint
app.put("/orders/:orderId/status", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'preparing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Broadcast status update to all connected clients
        io.emit('order_status_updated', {
            orderId: order.orderId,
            status: order.status,
            updatedAt: order.updatedAt
        });

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark order as preparing
app.put("/orders/:orderId/preparing", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { orderId } = req.params;

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { status: 'preparing', updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Broadcast status update
        io.emit('order_status_updated', {
            orderId: order.orderId,
            status: 'preparing',
            updatedAt: order.updatedAt
        });

        res.json({ message: 'Order marked as preparing', order });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark order as completed
app.put("/orders/:orderId/complete", verifyToken, async (req, res) => {
    try {
        await connectDB();
        const { orderId } = req.params;

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { status: 'completed', updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Broadcast status update
        io.emit('order_status_updated', {
            orderId: order.orderId,
            status: 'completed',
            updatedAt: order.updatedAt
        });

        res.json({ message: 'Order completed', order });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

async function createOrderFromCart(
    sessionId: string,
    paymentId: string,
    paymentStatus: 'completed' | 'pending' = 'completed'
) {
    const cart = await cartModel.findOne({ sessionId }).populate('items.dishId');

    if (!cart || cart.items.length === 0) {
        return null;
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const order = new orderModel({
        orderId,
        sessionId,
        items: cart.items.map((item: any) => ({
            dishId: item.dishId._id,
            dishName: item.dishId?.name || 'Dish',
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: cart.items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
        ),
        paymentId,
        paymentStatus,
        status: 'confirmed',
    });

    await order.save();
    await cartModel.deleteOne({ sessionId });

    io.emit('new_order', {
        _id: order._id,
        orderId: order.orderId,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        status: order.status,
    });

    return order;
}

// Create order after successful Stripe payment (called from frontend)
app.post("/orders/create", async (req, res) => {
    try {
        await connectDB();
        const { sessionId, paymentIntentId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'paymentIntentId is required' });
        }

        const existing = await orderModel.findOne({ paymentId: paymentIntentId });
        if (existing) {
            return res.status(200).json({
                message: 'Order already created',
                order: {
                    _id: existing._id,
                    orderId: existing.orderId,
                    items: existing.items,
                    totalAmount: existing.totalAmount,
                    createdAt: existing.createdAt,
                    status: existing.status,
                },
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        if (paymentIntent.metadata?.sessionId !== sessionId) {
            return res.status(400).json({ error: 'Session does not match payment' });
        }

        const order = await createOrderFromCart(sessionId, paymentIntentId, 'completed');

        if (!order) {
            return res.status(404).json({ error: 'Cart is empty or not found' });
        }

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                orderId: order.orderId,
                items: order.items,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                status: order.status,
            },
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

httpServer.listen(8080, () => {
    console.log('Server running on port 8080 with WebSocket support');
});