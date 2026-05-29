"use client";
import { useState, useEffect } from "react";
import { useAuth, useMenu } from "@/lib/orderFlow";
import { useRouter } from "next/navigation";
type MenuItem = {
  _id?: string;
  name: string;
  category: string;
  price: number;
  available?: boolean;
  image?: string;
  description?: string;
};
type ToastState = { msg: string; type: "success" | "error" };
const CATEGORIES = [
  "Biryani",
  "Noodles",
  "Mojitos",
  "Burgers",
  "Desserts",
  "Salads",
];
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={`toggle ${checked ? "on" : "off"}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className="toggle-knob" />
      <style jsx>{`
        .toggle {
          width: 44px;
          height: 24px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.25s;
          padding: 0;
        }
        .toggle.on {
          background: #2a9d6a;
        }
        .toggle.off {
          background: #2e2820;
        }
        .toggle-knob {
          position: absolute;
          top: 3px;
          width: 18px;
          height: 18px;
          background: #fff;
          border-radius: 50%;
          transition: left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .toggle.on .toggle-knob {
          left: 23px;
        }
        .toggle.off .toggle-knob {
          left: 3px;
        }
      `}</style>
    </button>
  );
}
function EditModal({
  item,
  onSave,
  onClose,
}: {
  item: MenuItem;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MenuItem>({ ...item });
  const set =
    (k: keyof MenuItem) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {" "}
            {item._id ? "Edit Item" : "Add New Item"}{" "}
          </h2>
          <button className="modal-close" onClick={onClose}>
            {" "}
            X{" "}
          </button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <label className="m-label">Item Name</label>
            <input
              className="m-input"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Chicken Dum Biryani"
            />
          </div>
          <div className="field-row">
            <label className="m-label">Description</label>
            <textarea
              className="m-input m-textarea"
              value={form.description || ""}
              onChange={set("description")}
              placeholder="Short description..."
              rows={2}
            />
          </div>
          <div className="field-row">
            <label className="m-label">Category</label>
            <select
              className="m-input m-select"
              value={form.category}
              onChange={set("category")}
            >
              {" "}
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}{" "}
            </select>
          </div>
          <div className="field-row">
            <label className="m-label">Price (Rs)</label>
            <input
              className="m-input"
              type="number"
              min="1"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
            />
          </div>
          <div className="field-row">
            <label className="m-label">Image URL</label>
            <input
              className="m-input"
              value={form.image || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, image: e.target.value }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="field-row avail-row">
            <label className="m-label">Available on Menu</label>
            <ToggleSwitch
              checked={form.available !== false}
              onChange={(v) => setForm((f) => ({ ...f, available: v }))}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="m-cancel" onClick={onClose}>
            {" "}
            Cancel{" "}
          </button>
          <button className="m-save" onClick={() => onSave(form)}>
            {" "}
            {item._id ? "Save Changes" : "Add Item"}{" "}
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: #1a1610;
          border: 1px solid #2e2820;
          border-radius: 22px;
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px 0;
        }
        .modal-title {
          font-size: 1.3rem;
          color: #f5ede0;
          font-weight: 700;
        }
        .modal-close {
          background: none;
          border: none;
          color: #6a5c48;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .modal-body {
          padding: 22px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .m-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #6a5c48;
        }
        .m-input {
          background: #0f0d09;
          border: 1.5px solid #2e2820;
          border-radius: 10px;
          padding: 11px 14px;
          color: #f5ede0;
          width: 100%;
        }
        .m-textarea {
          resize: none;
        }
        .avail-row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 0 28px 24px;
        }
        .m-cancel,
        .m-save {
          padding: 10px 22px;
          border-radius: 10px;
          cursor: pointer;
          border: none;
        }
        .m-save {
          background: #e8773a;
          color: white;
        }
      `}</style>
    </div>
  );
}
export default function AdminMenuManager() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { items, loading: itemsLoading, addItem, updateItem, deleteItem } = useMenu();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };
  const openNew = () =>
    setEditing({
      name: "",
      category: "Biryani",
      price: 199,
      available: true,
      image: "",
      description: "",
    });
  const handleSave = async (form: MenuItem) => {
    try {
      if (form._id) {
        const result = await updateItem(form._id, {
          name: form.name,
          price: form.price,
          image: form.image,
          description: form.description,
          category: form.category,
          available: form.available,
        });
        if (result.success) {
          showToast("Item updated successfully!");
        } else {
          showToast(result.error || "Failed to update", "error");
        }
      } else {
        const result = await addItem({
          name: form.name,
          price: form.price,
          image: form.image,
          category: form.category,
          description: form.description,
        });
        if (result.success) {
          showToast("Item added successfully!");
        } else {
          showToast(result.error || "Failed to add", "error");
        }
      }
      setEditing(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast("Error: " + message, "error");
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteItem(id);
      if (result.success) {
        showToast("Item deleted successfully!");
      } else {
        showToast(result.error || "Failed to delete", "error");
      }
      setDeleteId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast("Error: " + message, "error");
    }
  };
  const filtered = (items as MenuItem[]).filter((it) => {
    const matchCat = filterCat === "All" || it.category === filterCat;
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const stats = {
    total: items.length,
    active: items.filter((i: MenuItem) => i.available !== false).length,
    categories: [...new Set(items.map((i: MenuItem) => i.category))].length,
    avgPrice: items.length
      ? Math.round(
          items.reduce((s: number, i: MenuItem) => s + i.price, 0) /
            items.length,
        )
      : 0,
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
        {" "}
        Loading...{" "}
      </div>
    );
  }
  return (
    <>
      <style>{styles}</style>{" "}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {" "}
          {toast.type === "success" ? "" : "X"} {toast.msg}{" "}
        </div>
      )}{" "}
      {deleteId && (
        <div
          className="modal-overlay del-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="del-modal">
            <h3 className="del-title">Delete Item?</h3>
            <p className="del-sub"> This action cannot be undone. </p>
            <div className="del-btns">
              <button className="m-cancel" onClick={() => setDeleteId(null)}>
                {" "}
                Cancel{" "}
              </button>
              <button
                className="del-confirm"
                onClick={() => handleDelete(deleteId)}
              >
                {" "}
                Delete{" "}
              </button>
            </div>
          </div>
        </div>
      )}{" "}
      {editing && (
        <EditModal
          item={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}{" "}
      <div className="admin-page">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-name">luscious</span>
          </div>
          <nav className="sidebar-nav">
            <a href="/admin/menu" className="nav-item active">
              {" "}
              Menu{" "}
            </a>
            <a href="/admin/orders" className="nav-item">
              {" "}
              Orders{" "}
            </a>
          </nav>
          <button className="logout-btn" onClick={logout}>
            {" "}
            Logout{" "}
          </button>
        </aside>
        <main className="admin-main">
          <div className="admin-topbar">
            <div>
              <h1 className="admin-title">Menu Manager</h1>
              <p className="admin-sub"> Manage your menu items </p>
            </div>
            <button className="add-btn" onClick={openNew}>
              {" "}
              + Add Item{" "}
            </button>
          </div>
          <div className="stats-row">
            {" "}
            {[
              { label: "Total Items", val: stats.total },
              { label: "Active Items", val: stats.active },
              { label: "Categories", val: stats.categories },
              { label: "Avg. Price", val: `Rs ${stats.avgPrice}` },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div>
                  <p className="stat-val">{s.val}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            ))}{" "}
          </div>
          <div className="filters-bar">
            <input
              className="search-input"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="cat-filters">
              {" "}
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  className={`cat-chip ${filterCat === c ? "active" : ""}`}
                  onClick={() => setFilterCat(c)}
                >
                  {" "}
                  {c}{" "}
                </button>
              ))}{" "}
            </div>
          </div>
          <div className="table-wrap">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {itemsLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      {" "}
                      Loading items...{" "}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      {" "}
                      No items found{" "}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr
                      key={item._id}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                      className="table-row"
                    >
                      <td>
                        <div className="item-cell">
                          <div>
                            <p className="table-name"> {item.name} </p>
                            <p className="table-desc">
                              {" "}
                              {(item.description || "").slice(0, 42)} ...{" "}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-cat"> {item.category} </span>
                      </td>
                      <td>
                        <span className="table-price"> Rs {item.price} </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="action-edit"
                            onClick={() => setEditing(item)}
                          >
                            {" "}
                            Edit{" "}
                          </button>
                          <button
                            className="action-del"
                            onClick={() => setDeleteId(item._id!)}
                          >
                            {" "}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}{" "}
              </tbody>
            </table>
          </div>
          <p className="table-count">
            {" "}
            Showing {filtered.length} of {items.length} items{" "}
          </p>
        </main>
      </div>
    </>
  );
}
const styles = `
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #0b0b0c;
  color: #f5f5f5;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

body {
  overflow-x: hidden;
}

.admin-page {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, #1c1a17 0%, transparent 30%),
    radial-gradient(circle at bottom right, #2a1408 0%, transparent 30%),
    #0b0b0c;
}

/* SIDEBAR */

.sidebar {
  width: 250px;
  background: rgba(20,20,20,0.88);
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  backdrop-filter: blur(18px);
}

.sidebar-brand {
  margin-bottom: 42px;
}

.brand-name {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(90deg,#fff,#e8773a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  text-decoration: none;
  color: #b5b5b5;
  padding: 14px 16px;
  border-radius: 14px;
  transition: all .22s ease;
  font-weight: 600;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg,#e8773a,#ff9f68);
  color: white;
  box-shadow: 0 10px 30px rgba(232,119,58,.25);
}

.logout-btn {
  margin-top: auto;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all .2s ease;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
}

/* MAIN */

.admin-main {
  flex: 1;
  padding: 40px;
}

.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 34px;
  gap: 20px;
  flex-wrap: wrap;
}

.admin-title {
  font-size: 2.2rem;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.admin-sub {
  color: #9d9d9d;
  margin-top: 8px;
}

.add-btn {
  background: linear-gradient(135deg,#e8773a,#ff9f68);
  border: none;
  color: white;
  padding: 14px 22px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 10px 24px rgba(232,119,58,.25);
}

.add-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(232,119,58,.35);
}

/* STATS */

.stats-row {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 18px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 24px;
  backdrop-filter: blur(12px);
  transition: all .25s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(232,119,58,.3);
}

.stat-val {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}

.stat-label {
  margin-top: 8px;
  color: #999;
  font-size: .92rem;
}

/* FILTERS */

.filters-bar {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.search-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: white;
  padding: 14px 16px;
  border-radius: 16px;
  min-width: 280px;
  outline: none;
  transition: .2s ease;
}

.search-input:focus {
  border-color: #e8773a;
  box-shadow: 0 0 0 4px rgba(232,119,58,.15);
}

.cat-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cat-chip {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: #ddd;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  transition: .2s ease;
}

.cat-chip:hover {
  background: rgba(255,255,255,0.08);
}

.cat-chip.active {
  background: linear-gradient(135deg,#e8773a,#ff9f68);
  color: white;
  border: none;
}

/* TABLE */

.table-wrap {
  background: rgba(255,255,255,0.04);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
}

.menu-table thead {
  background: rgba(255,255,255,0.03);
}

.menu-table th {
  text-align: left;
  padding: 18px 22px;
  color: #8d8d8d;
  font-size: .82rem;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.table-row {
  transition: all .2s ease;
}

.table-row:hover {
  background: rgba(255,255,255,0.03);
}

.menu-table td {
  padding: 22px;
  border-top: 1px solid rgba(255,255,255,0.04);
}

.table-name {
  margin: 0;
  font-weight: 700;
}

.table-desc {
  color: #8f8f8f;
  margin-top: 6px;
  font-size: .92rem;
}

.table-cat {
  background: rgba(232,119,58,.14);
  color: #ffb184;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: .85rem;
}

.table-price {
  font-weight: 800;
  color: #ff9f68;
}

.action-btns {
  display: flex;
  gap: 10px;
}

.action-edit,
.action-del {
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: .2s ease;
  font-weight: 600;
}

.action-edit {
  background: rgba(255,255,255,0.06);
  color: white;
}

.action-edit:hover {
  background: rgba(255,255,255,0.12);
}

.action-del {
  background: rgba(255,80,80,.12);
  color: #ff8f8f;
}

.action-del:hover {
  background: rgba(255,80,80,.2);
}

/* TOAST */

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 14px 18px;
  border-radius: 16px;
  backdrop-filter: blur(12px);
  z-index: 999;
}

.toast-success {
  background: rgba(42,157,106,.15);
  border: 1px solid rgba(42,157,106,.4);
}

.toast-error {
  background: rgba(224,82,82,.15);
  border: 1px solid rgba(224,82,82,.4);
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .stats-row {
    grid-template-columns: repeat(2,1fr);
  }
}

@media (max-width: 820px) {
  .admin-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .admin-main {
    padding: 24px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
    min-width: unset;
  }

  .admin-topbar {
    align-items: flex-start;
  }
}
`;