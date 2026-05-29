"use client";

import { useState, useEffect } from "react";
import { useAuth, useOrders } from "@/lib/orderFlow";
import { useRouter } from "next/navigation";
import type { Order, Toast } from "@/lib/types";

type OrderCardProps = {
  order: Order;
  onMarkPreparing: (orderId: string) => void;
  onMarkComplete: (orderId: string) => void;
};

function OrderCard({ order, onMarkPreparing, onMarkComplete }: OrderCardProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  return (
    <div className={`order-card status-${order.status}`}>
      <div className="order-info">
        <p className="order-title">
          Order #{order.orderId?.slice(-6) || order._id.slice(-6)}
        </p>
        <div className="order-items">
          {order.items.map((item, idx) => (
            <span key={idx} className="item-badge">
              {item.quantity}x {item.dishName}
            </span>
          ))}
        </div>
        <div className="order-meta">
          <span className="order-time">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
          <span className="order-total">Rs {order.totalAmount}</span>
        </div>
      </div>

      <div className="order-actions">
        <div style={{ position: "relative" }}>
          <button
            className="status-btn"
            type="button"
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
          >
            {getStatusLabel(order.status)}
          </button>
          {statusMenuOpen && (
            <div className="status-menu">
              <button
                type="button"
                onClick={() => {
                  onMarkPreparing(order._id);
                  setStatusMenuOpen(false);
                }}
              >
                Preparing
              </button>
              <button
                type="button"
                onClick={() => {
                  onMarkComplete(order._id);
                  setStatusMenuOpen(false);
                }}
              >
                Completed
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .order-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #1a1610;
          border: 1px solid #2e2820;
          border-radius: 16px;
          padding: 14px 16px;
        }
        .order-info {
          flex: 1;
          min-width: 0;
        }
        .order-title {
          font-weight: 600;
          color: #f5ede0;
          font-size: 0.95rem;
          margin: 0;
        }
        .order-items {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 5px;
        }
        .item-badge {
          font-size: 0.72rem;
          background: #2e2820;
          color: #b89a70;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .order-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 5px;
        }
        .order-time {
          font-size: 0.75rem;
          color: #6a5c48;
        }
        .order-total {
          font-size: 0.85rem;
          font-weight: 700;
          color: #e8773a;
        }
        .status-btn {
          padding: 8px 16px;
          background: #e8773a;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .status-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: #0f0d09;
          border: 1px solid #2e2820;
          border-radius: 8px;
          margin-top: 4px;
          z-index: 10;
        }
        .status-menu button {
          display: block;
          width: 100%;
          padding: 10px 15px;
          background: none;
          border: none;
          color: #b89a70;
          cursor: pointer;
          text-align: left;
          font-size: 0.85rem;
        }
        .status-menu button:hover {
          background: #1a1610;
          color: #e8773a;
        }
      `}</style>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    completed: "Done",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders, markPreparing, markComplete } =
    useOrders();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchId, setSearchId] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    } else if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, isAuthenticated, router, fetchOrders]);

  const showToast = (msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleMarkPreparing = async (orderId: string) => {
    const result = await markPreparing(orderId);
    if (result.success) {
      showToast("Order marked as preparing");
    } else {
      showToast(result.error || "Failed to update", "error");
    }
  };

  const handleMarkComplete = async (orderId: string) => {
    const result = await markComplete(orderId);
    if (result.success) {
      showToast("Order marked as completed");
    } else {
      showToast(result.error || "Failed to update", "error");
    }
  };

  const filtered = orders.filter((order: Order) => {
    const matchStatus = filterStatus === "All" || order.status === filterStatus;
    const matchId =
      !searchId ||
      order.orderId?.includes(searchId) ||
      order._id?.includes(searchId);
    return matchStatus && matchId;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o: Order) => o.status === "pending" || o.status === "confirmed"
    ).length,
    preparing: orders.filter((o: Order) => o.status === "preparing").length,
    completed: orders.filter((o: Order) => o.status === "completed").length,
  };

  if (authLoading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "#0f0d09",
          color: "#f5ede0",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "OK" : "ERR"} {toast.msg}
        </div>
      )}

      <div className="admin-page">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-name">luscious</span>
          </div>
          <nav className="sidebar-nav">
            <a href="/admin/menu" className="nav-item">
              Menu
            </a>
            <a href="/admin/orders" className="nav-item active">
              Orders
            </a>
          </nav>
          <button className="logout-btn" type="button" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div>
              <h1 className="admin-title">Order Kitchen</h1>
              <p className="admin-sub">Manage and track incoming orders</p>
            </div>
          </div>

          <div className="stats-row">
            {[
              { label: "Total Orders", val: stats.total, color: "#b89a70" },
              { label: "Pending / Confirmed", val: stats.pending, color: "#e8773a" },
              { label: "Preparing", val: stats.preparing, color: "#f0a030" },
              { label: "Completed", val: stats.completed, color: "#2a9d6a" },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div>
                  <p className="stat-val" style={{ color: s.color }}>
                    {s.val}
                  </p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="filters-bar">
            <input
              className="search-input"
              placeholder="Search order ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <div className="status-filters">
              {["All", "pending", "confirmed", "preparing", "completed"].map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    className={`status-chip ${filterStatus === status ? "active" : ""}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === "All" ? "All Orders" : getStatusLabel(status)}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="orders-container">
            {ordersLoading ? (
              <p style={{ textAlign: "center", padding: "40px", color: "#a38c79" }}>
                Loading orders...
              </p>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">No orders found</p>
                <p className="empty-sub">
                  Orders will appear here as customers place them
                </p>
              </div>
            ) : (
              filtered.map((order: Order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onMarkPreparing={handleMarkPreparing}
                  onMarkComplete={handleMarkComplete}
                />
              ))
            )}
          </div>

          <p className="orders-count">
            Showing {filtered.length} of {orders.length} orders
          </p>
        </main>
      </div>
    </>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .admin-page { display: flex; min-height: 100vh; background: #0f0d09; font-family: 'DM Sans', sans-serif; color: #f5ede0; }
  .sidebar { width: 220px; background: #1a1610; border-right: 1px solid #2e2820; padding: 28px 20px; display: flex; flex-direction: column; }
  .brand-name { font-size: 1.3rem; font-weight: 700; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; margin-top: 28px; }
  .nav-item { padding: 10px 14px; border-radius: 10px; color: #6a5c48; text-decoration: none; }
  .nav-item.active { background: #e8773a1a; color: #e8773a; font-weight: 700; }
  .logout-btn { background: none; border: 1.5px solid #2e2820; color: #6a5c48; padding: 10px 14px; border-radius: 10px; cursor: pointer; margin-top: 12px; }
  .admin-main { flex: 1; padding: 36px; }
  .admin-title { font-size: 1.8rem; font-weight: 700; }
  .admin-sub { color: #6a5c48; font-size: 0.85rem; margin-top: 4px; }
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 28px 0; }
  .stat-card { background: #1a1610; border: 1px solid #2e2820; border-radius: 16px; padding: 18px 20px; }
  .stat-val { font-size: 1.4rem; font-weight: 700; }
  .stat-label { font-size: 0.72rem; color: #6a5c48; margin-top: 2px; }
  .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .search-input { background: #1a1610; border: 1.5px solid #2e2820; border-radius: 10px; padding: 10px 16px; color: #f5ede0; width: 220px; }
  .status-filters { display: flex; gap: 8px; flex-wrap: wrap; }
  .status-chip { background: transparent; border: 1.5px solid #2e2820; color: #6a5c48; padding: 7px 14px; border-radius: 50px; cursor: pointer; }
  .status-chip.active { background: #e8773a; border-color: #e8773a; color: #fff; }
  .orders-container { display: flex; flex-direction: column; gap: 12px; }
  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-text { font-size: 1.3rem; font-weight: 600; }
  .empty-sub { color: #a38c79; margin-top: 10px; }
  .orders-count { color: #3a3228; font-size: 0.78rem; margin-top: 12px; }
  .toast { position: fixed; bottom: 28px; right: 28px; background: #1a1610; border: 1px solid #2e2820; padding: 14px 22px; border-radius: 12px; z-index: 300; }
  .toast-success { border-color: #2a9d6a; color: #2a9d6a; }
  .toast-error { border-color: #e05252; color: #e05252; }
  @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
`;
