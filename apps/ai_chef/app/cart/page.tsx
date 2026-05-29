"use client";

import { useState, useEffect } from "react";
import { getOrCreateSessionId, useCart } from "@/lib/orderFlow";
import LoadingPage from "@/components/LoadingPage";
import PaymentForm from "@/components/PaymentForm";
import type { CartItem } from "@/lib/types";

export default function CartPage() {
  const [sessionId, setSessionId] =
    useState("");

  const {
    cart,
    loading,
    removeFromCart,
    clearCart,
    refetchCart,
  } = useCart(sessionId);

  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const TAX_RATE = 0.05;
  const DELIVERY = 49;

  useEffect(() => {
    setSessionId(
      getOrCreateSessionId()
    );
  }, []);

  const handleRemoveItem =
    async (dishId: string) => {
      await removeFromCart(
        dishId
      );
    };

  const handleClearCart =
    async () => {
      await clearCart();
    };

  const handlePlaceOrder =
    () => {
      if (
        !cart ||
        cart.items.length === 0
      ) {
        setError(
          "Cart is empty"
        );

        return;
      }

      setError("");
      setShowPayment(true);
    };

  const cartItems: CartItem[] =
    cart?.items ?? [];

  const subtotal =
    cartItems.reduce(
      (
        s: number,
        item: CartItem
      ) =>
        s +
        item.price *
          item.quantity,
      0
    );

  const tax = Math.round(
    subtotal * TAX_RATE
  );

  const finalTotal =
    subtotal +
    tax +
    (cartItems.length
      ? DELIVERY
      : 0);

  const handlePaymentSuccess = (order: { orderId: string }) => {
    setShowPayment(false);
    setPlacedOrderId(order.orderId);
    setPlaced(true);
    refetchCart();
  };

  if (!sessionId || loading) {
    return <LoadingPage />;
  }

  if (placed) {
    return (
      <>
        <style>{globalStyles}</style>

        <div className="cart-placed">
          <div className="placed-card">
            <div className="placed-emoji">
              🎉
            </div>

            <h2 className="placed-title">
              Order Placed!
            </h2>

            <p className="placed-sub">
              Your food is being
              lovingly prepared.
              <br />
              Estimated delivery:{" "}
              <strong>
                30–40 min
              </strong>
            </p>

            <div className="placed-id">
              Order #{placedOrderId ?? "—"}
            </div>

            <button
              className="placed-btn"
              onClick={() => {
                setPlaced(false);
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>

      <div className="cart-page">
        <div className="cart-header">
          <p className="cart-eyebrow">
            Your Selection
          </p>

          <h1 className="cart-title">
            Your Cart
          </h1>

          <p className="cart-count">
            {cartItems.reduce(
              (s, i) =>
                s +
                i.quantity,
              0
            )}{" "}
            items waiting for you
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-emoji">
              🍽️
            </span>

            <p className="empty-text">
              Your cart is empty
            </p>

            <p className="empty-sub">
              Go back and explore
              the menu
            </p>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              {cartItems.map(
                (
                  item: CartItem,
                  idx: number
                ) => (
                  <div
                    className="cart-item"
                    key={
                      item.dishId
                    }
                    style={{
                      animationDelay: `${idx * 0.06}s`,
                    }}
                  >
                    <div className="item-emoji-box">
                      {item.image ||
                        "🍽️"}
                    </div>

                    <div className="item-info">
                      <p className="item-cat">
                        {item.category ||
                          "Item"}
                      </p>

                      <h3 className="item-name">
                        {item.dishName ||
                          "Dish"}
                      </h3>

                      <p className="item-unit">
                        ₹
                        {item.price}{" "}
                        each
                      </p>
                    </div>

                    <div className="item-right">
                      <div className="qty-ctrl">
                        <button
                          className="qty-btn"
                          onClick={() => {
                            if (
                              item.quantity >
                              1
                            ) {
                              // backend quantity update later
                            }
                          }}
                        >
                          −
                        </button>

                        <span className="qty-num">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          className="qty-btn"
                          onClick={() => {}}
                        >
                          +
                        </button>
                      </div>

                      <p className="item-total">
                        ₹
                        {item.price *
                          item.quantity}
                      </p>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        handleRemoveItem(
                          item.dishId
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h2 className="summary-title">
                Order Summary
              </h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal}
                  </span>
                </div>

                <div className="summary-row">
                  <span>
                    GST (5%)
                  </span>

                  <span>
                    ₹{tax}
                  </span>
                </div>

                <div className="summary-row">
                  <span>
                    Delivery
                  </span>

                  <span>
                    ₹
                    {DELIVERY}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>
                    Total
                  </span>

                  <span>
                    ₹
                    {finalTotal}
                  </span>
                </div>
              </div>

              <button
                className="place-btn"
                type="button"
                onClick={handlePlaceOrder}
              >
                Pay with Stripe
              </button>

              <button
                className="clear-btn"
                onClick={
                  handleClearCart
                }
              >
                Clear Cart
              </button>

              <div className="secure-note">
                🔒 Secure checkout
              </div>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentForm
          total={finalTotal}
          sessionId={sessionId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </>
  );
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #fffdf9;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
}

.cart-page {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top,
      #fff6ef 0%,
      #fffdf9 45%
    );

  font-family:
    'DM Sans',
    sans-serif;

  padding: 50px 24px 80px;
}

.cart-header {
  text-align: center;
  margin-bottom: 44px;
}

.cart-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #e8773a;
  margin-bottom: 8px;
}

.cart-title {
  font-family:
    'Playfair Display',
    serif;

  font-size: clamp(
    2rem,
    5vw,
    3.2rem
  );

  color: #1a1208;
  font-weight: 700;
}

.cart-count {
  color: #9a8870;
  margin-top: 8px;
}

.error-message {
  background: #ffe5e5;
  color: #d33;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
}

.cart-layout {
  max-width: 1180px;
  margin: 0 auto;

  display: grid;
  grid-template-columns:
    1fr 360px;

  gap: 32px;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns:
      1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cart-item {
  background: #fff;

  border: 1px solid
    #ede8e0;

  border-radius: 18px;

  padding: 18px 20px;

  display: flex;
  align-items: center;
  gap: 18px;

  animation:
    slideIn 0.45s ease
    both;

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.cart-item:hover {
  transform: translateY(-3px);

  box-shadow:
    0 10px 28px
    rgba(
      80,
      50,
      20,
      0.08
    );
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform:
      translateX(-14px);
  }

  to {
    opacity: 1;
    transform:
      translateX(0);
  }
}

.item-emoji-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;

  background:
    linear-gradient(
      135deg,
      #fff8f3,
      #fdeedd
    );

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 2rem;
}

.item-info {
  flex: 1;
}

.item-cat {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e8773a;
  margin-bottom: 3px;
}

.item-name {
  font-family:
    'Playfair Display',
    serif;

  font-size: 1.05rem;
  color: #1a1208;
  margin: 0;
}

.item-unit {
  font-size: 0.82rem;
  color: #9a8870;
  margin-top: 5px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.qty-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;

  background: #f5f0e8;

  border-radius: 50px;

  padding: 6px 14px;
}

.qty-btn {
  background: none;
  border: none;
  cursor: pointer;

  font-size: 1.1rem;
  color: #e8773a;
  font-weight: 700;

  width: 24px;
  height: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    transform 0.15s ease;

  border-radius: 50%;
}

.qty-btn:hover {
  transform: scale(1.25);
  background: #e8773a22;
}

.qty-num {
  font-weight: 700;
  color: #1a1208;
}

.item-total {
  font-weight: 700;
  color: #1a1208;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #b0a090;
  cursor: pointer;
  font-size: 1rem;

  transition: 0.2s ease;
}

.remove-btn:hover {
  color: #e05252;
  transform: scale(1.2);
}

.cart-summary {
  background: #fff;

  border: 1px solid
    #ede8e0;

  border-radius: 20px;

  padding: 28px 24px;

  position: sticky;
  top: 24px;

  height: fit-content;
}

.summary-title {
  font-family:
    'Playfair Display',
    serif;

  font-size: 1.35rem;
  color: #1a1208;
  margin-bottom: 22px;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #5a4a35;
}

.summary-divider {
  height: 1px;
  background: #ede8e0;
}

.total-row {
  font-size: 1.08rem;
  font-weight: 700;
  color: #1a1208;
}

.place-btn {
  width: 100%;
  margin-top: 24px;
  padding: 16px;

  border-radius: 14px;

  background: #e8773a;
  color: white;

  border: none;

  font-weight: 700;
  font-size: 1rem;

  cursor: pointer;

  transition:
    background 0.22s ease,
    transform 0.18s
      cubic-bezier(
        0.34,
        1.56,
        0.64,
        1
      ),
    box-shadow 0.2s;
}

.place-btn:hover:not(:disabled) {
  background: #d4692e;

  transform: scale(1.02);

  box-shadow:
    0 8px 24px
    rgba(
      232,
      119,
      58,
      0.35
    );
}

.place-btn:disabled {
  background: #9d7563;
  cursor: not-allowed;
  opacity: 0.7;
}

.clear-btn {
  width: 100%;
  margin-top: 12px;
  padding: 14px;

  border-radius: 14px;

  background: transparent;

  border: 1px solid
    #ede8e0;

  cursor: pointer;

  transition: 0.2s ease;
}

.clear-btn:hover {
  background: #faf8f5;
}

.secure-note {
  text-align: center;
  color: #b0a090;
  margin-top: 14px;
  font-size: 0.72rem;
}

.cart-empty {
  text-align: center;
  padding: 120px 20px;
}

.empty-emoji {
  font-size: 4rem;
  display: block;
  margin-bottom: 14px;
}

.empty-text {
  font-family:
    'Playfair Display',
    serif;

  font-size: 1.7rem;
  color: #1a1208;
}

.empty-sub {
  color: #9a8870;
  margin-top: 8px;
}

.cart-placed {
  min-height: 100vh;
  background: #faf8f5;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;
}

.placed-card {
  background: white;

  border: 1px solid
    #ede8e0;

  border-radius: 26px;

  padding: 60px 48px;

  text-align: center;

  max-width: 420px;

  animation:
    popIn 0.5s
    cubic-bezier(
      0.34,
      1.56,
      0.64,
      1
    );
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.85);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.placed-emoji {
  font-size: 4rem;
  margin-bottom: 16px;
}

.placed-title {
  font-family:
    'Playfair Display',
    serif;

  font-size: 2rem;
  color: #1a1208;
}

.placed-sub {
  color: #7a6a55;
  margin: 14px 0 24px;
  line-height: 1.7;
}

.placed-id {
  display: inline-block;

  background: #fdeedd;
  color: #e8773a;

  font-weight: 700;

  padding: 8px 18px;

  border-radius: 999px;

  margin-bottom: 26px;
}

.placed-btn {
  background: #e8773a;
  color: white;

  padding: 14px 28px;

  border-radius: 14px;

  border: none;

  cursor: pointer;

  transition: 0.2s ease;
}

.placed-btn:hover {
  background: #d4692e;
}
`;