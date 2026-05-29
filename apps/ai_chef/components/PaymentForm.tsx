"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

export type PlacedOrder = {
  orderId: string;
  _id?: string;
};

type PaymentFormProps = {
  total: number;
  sessionId: string;
  onSuccess: (order: PlacedOrder) => void;
  onCancel: () => void;
};

function CheckoutForm({
  total,
  sessionId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) {
      setError("Payment is still loading. Please wait.");
      return;
    }

    setLoading(true);

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment failed");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Payment was not completed. Please try again.");
      }

      const orderResponse = await fetch(`${API_BASE_URL}/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          paymentIntentId: paymentIntent.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      onSuccess({
        orderId: orderData.order?.orderId ?? orderData.orderId,
        _id: orderData.order?._id,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="payment-amount">
        <span className="amount-label">Total amount</span>
        <span className="amount-value">
          Rs {total.toLocaleString("en-IN")}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="stripe-element-wrap">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !stripe}
            className="btn-submit"
          >
            {loading ? "Processing..." : `Pay Rs ${total.toLocaleString("en-IN")}`}
          </button>
        </div>
      </form>

      <p className="security-note">
        Payments are processed securely by Stripe (test mode).
      </p>

      <style jsx>{`
        .payment-amount {
          background: rgba(232, 119, 58, 0.1);
          border: 1px solid rgba(232, 119, 58, 0.3);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .amount-label {
          font-size: 0.9rem;
          color: #a38c79;
        }
        .amount-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #e8773a;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .stripe-element-wrap {
          background: #0f0d09;
          border: 1.5px solid #2e2820;
          border-radius: 12px;
          padding: 16px;
        }
        .form-error {
          background: rgba(224, 82, 82, 0.15);
          border: 1px solid rgba(224, 82, 82, 0.4);
          color: #ff9f9f;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
        }
        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }
        .btn-cancel,
        .btn-submit {
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: #a38c79;
          border: 1px solid #2e2820;
        }
        .btn-submit {
          background: linear-gradient(135deg, #e8773a, #ff9f68);
          color: white;
        }
        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .security-note {
          text-align: center;
          font-size: 0.75rem;
          color: #6a5c48;
          margin-top: 16px;
        }
        @media (max-width: 480px) {
          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default function PaymentForm({
  total,
  sessionId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState("");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!stripePublishableKey) {
      setInitError(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add your Stripe publishable key to apps/ai_chef/.env.local"
      );
      setInitializing(false);
      return;
    }

    let cancelled = false;

    async function createIntent() {
      try {
        setInitializing(true);
        setInitError("");

        const res = await fetch(`${API_BASE_URL}/payment/intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, amount: total }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to start payment");
        }

        if (!cancelled) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        if (!cancelled) {
          setInitError(
            err instanceof Error ? err.message : "Failed to start payment"
          );
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    createIntent();

    return () => {
      cancelled = true;
    };
  }, [sessionId, total]);

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2 className="payment-title">Complete payment</h2>
          <button
            className="payment-close"
            onClick={onCancel}
            disabled={initializing}
            type="button"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className="payment-body">
          {initializing && (
            <p className="payment-status">Preparing secure checkout...</p>
          )}

          {initError && (
            <div className="form-error">{initError}</div>
          )}

          {!initializing &&
            !initError &&
            clientSecret &&
            stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#e8773a",
                      colorBackground: "#0f0d09",
                      colorText: "#f5ede0",
                      colorDanger: "#e05252",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  total={total}
                  sessionId={sessionId}
                  onSuccess={onSuccess}
                  onCancel={onCancel}
                />
              </Elements>
            )}
        </div>
      </div>

      <style jsx>{`
        .payment-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .payment-modal {
          background: #1a1610;
          border: 1px solid #2e2820;
          border-radius: 24px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid #2e2820;
        }
        .payment-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f5ede0;
          margin: 0;
        }
        .payment-close {
          background: none;
          border: none;
          color: #6a5c48;
          font-size: 1rem;
          cursor: pointer;
        }
        .payment-body {
          padding: 28px;
        }
        .payment-status {
          color: #a38c79;
          text-align: center;
          margin: 0;
        }
        .form-error {
          background: rgba(224, 82, 82, 0.15);
          border: 1px solid rgba(224, 82, 82, 0.4);
          color: #ff9f9f;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
