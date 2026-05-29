/**
 * Frontend utilities for AI Chef Order Flow
 * Use these hooks in your React components
 */

import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ==================== STORAGE UTILITIES ====================

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
};

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
};

export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

type RawCartItem = {
  dishId: string | { _id?: string; name?: string; category?: string; image?: string };
  dishName?: string;
  category?: string;
  image?: string;
  price: number;
  quantity: number;
};

export const normalizeCartItems = (items: RawCartItem[] = []) =>
  items.map((item) => {
    const dish =
      item.dishId && typeof item.dishId === 'object' ? item.dishId : null;
    const dishId =
      dish?._id?.toString() ??
      (typeof item.dishId === 'string' ? item.dishId : String(item.dishId));

    return {
      dishId,
      dishName: dish?.name ?? item.dishName ?? 'Dish',
      category: dish?.category ?? item.category,
      image: dish?.image ?? item.image,
      price: item.price,
      quantity: item.quantity,
    };
  });

// ==================== AUTH UTILITIES ====================

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Login failed' };
      }
      
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Signup failed' };
      }
      
      return { success: true };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setIsAuthenticated(false);
    router.push('/signin');
  }, [router]);

  return { isAuthenticated, loading, login, signup, logout };
};

// ==================== MENU UTILITIES ====================

export const useMenu = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/items`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (item: any) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/newitem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to add item' };
      }
      
      setItems(prev => [...prev, data.dish]);
      return { success: true, dish: data.dish };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: any) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/change-item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to update item' };
      }
      
      setItems(prev => prev.map(item => item._id === id ? data.dish : item));
      return { success: true, dish: data.dish };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const addItemToCart = useCallback(
    async ({
      sessionId,
      dishId,
      quantity = 1,
    }: {
      sessionId: string;
      dishId: string;
      quantity?: number;
    }) => {
      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, dishId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }
      return data;
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to delete item' };
      }
      
      setItems(prev => prev.filter(item => item._id !== id));
      return { success: true };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  // Set up WebSocket listeners for real-time menu updates
  useEffect(() => {
    fetchItems();
    
    const socket = io(API_BASE_URL);
    
    socket.on('menu_item_added', (newItem: any) => {
      setItems(prev => [...prev, newItem]);
    });
    
    socket.on('menu_item_updated', (updatedItem: any) => {
      setItems(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
    });
    
    socket.on('menu_item_deleted', (data: any) => {
      setItems(prev => prev.filter(item => item._id !== data.id));
    });
    
    return () => {
      socket.disconnect();
    };
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    addItemToCart,
  };
};

// ==================== ORDERS UTILITIES ====================

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (sessionId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = sessionId ? `/orders/${sessionId}` : '/orders';
      const headers: any = { 'Content-Type': 'application/json' };
      
      // Add auth token for admin endpoint
      if (!sessionId) {
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to update status' };
      }
      
      setOrders(prev => prev.map(order => order._id === orderId ? data.order : order));
      return { success: true, order: data.order };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const markPreparing = useCallback(async (orderId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/preparing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to mark preparing' };
      }
      
      setOrders(prev => prev.map(order => order._id === orderId ? data.order : order));
      return { success: true, order: data.order };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  const markComplete = useCallback(async (orderId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { error: data.error || 'Failed to mark complete' };
      }
      
      setOrders(prev => prev.map(order => order._id === orderId ? data.order : order));
      return { success: true, order: data.order };
    } catch (error) {
      return { error: 'Network error' };
    }
  }, []);

  // Set up WebSocket listeners for real-time order updates
  useEffect(() => {
    const socket = io(API_BASE_URL);
    
    socket.on('new_order', (newOrder: any) => {
      setOrders(prev => [newOrder, ...prev]);
    });
    
    socket.on('order_status_updated', (updatedOrder: any) => {
      setOrders(prev => prev.map(order => 
        order.orderId === updatedOrder.orderId 
          ? { ...order, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt }
          : order
      ));
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  return { orders, loading, error, fetchOrders, updateOrderStatus, markPreparing, markComplete };
};

// ==================== CART UTILITIES ====================

export const useCart = (sessionId: string) => {
  const [cart, setCart] = useState<{ sessionId: string; items: ReturnType<typeof normalizeCartItems> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch cart');
      }
      const items = normalizeCartItems(data.cart?.items ?? data.items ?? []);
      setCart(items.length ? { sessionId, items } : null);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const addToCart = useCallback(
    async (dishId: string, quantity: number = 1) => {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, dishId, quantity })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to add to cart');
        }
        const items = normalizeCartItems(data.cart?.items ?? []);
        setCart({ sessionId, items });
        setTotal(
          items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        );
        return data;
      } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
    },
    [sessionId]
  );

  const removeFromCart = useCallback(
    async (dishId: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/remove`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, dishId })
        });
        const data = await res.json();
        if (data.message === 'Item removed, cart is now empty') {
          setCart(null);
          setTotal(0);
        } else {
          const items = normalizeCartItems(data.cart?.items ?? []);
          setCart(items.length ? { sessionId, items } : null);
          setTotal(
            items.reduce((sum, item) => sum + item.price * item.quantity, 0)
          );
        }
        return data;
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    },
    [sessionId]
  );

  const clearCart = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      setCart(null);
      setTotal(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [sessionId]);

  const createOrder = useCallback(async () => {
    try {
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      const res = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      // Clear cart after successful order creation
      setCart(null);
      setTotal(0);
      return { success: true, order: data.order };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      return { error: message };
    }
  }, [sessionId, cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, total, loading, addToCart, removeFromCart, clearCart, createOrder, refetchCart: fetchCart };
};

// ==================== PAYMENT UTILITIES ====================

export const usePayment = (sessionId: string) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = useCallback(
    async (amount: number) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/payment/intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, amount })
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
        return data;
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return { clientSecret, loading, createPaymentIntent };
};



// ==================== WEBSOCKET UTILITIES ====================

export const useOrderUpdates = (sessionId: string) => {
  const [newOrder, setNewOrder] = useState<any>(null);
  const [orderUpdate, setOrderUpdate] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL);

    newSocket.emit('register_session', sessionId);

    newSocket.on('new_order', (data: unknown) => {
      console.log('New order received:', data);
      setNewOrder(data);
    });

    newSocket.on('order_status_updated', (data: unknown) => {
      console.log('Order updated:', data);
      setOrderUpdate(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  return { newOrder, orderUpdate, socket };
};

// ==================== EXAMPLE INTEGRATION ====================

/**
 * Example: Complete checkout flow
 * 
 * 1. Customer adds items to cart
 * const { addToCart } = useCart(sessionId);
 * await addToCart(dishId, quantity);
 * 
 * 2. View cart
 * const { cart, total } = useCart(sessionId);
 * 
 * 3. Checkout
 * const { createPaymentIntent } = usePayment(sessionId);
 * const { clientSecret } = await createPaymentIntent(total);
 * // Use clientSecret with Stripe.js
 * 
 * 4. Listen for real-time updates
 * const { newOrder, orderUpdate } = useOrderUpdates(sessionId);
 * 
 * 5. View orders
 * const { orders } = useOrders(sessionId);
 */
