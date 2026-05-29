"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type AuthMode = "login" | "signup";
type AuthForm = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};
type AuthErrors = Partial<Record<keyof AuthForm, string>>;
export default function AdminAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const set =
    (k: keyof AuthForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: "" }));
    };
  const validate = (): AuthErrors => {
    const e: AuthErrors = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (mode === "signup" && form.password !== form.confirm)
      e.confirm = "Passwords don't match";
    return e;
  };
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/admin/menu");
  };
  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-bg-blob blob1" />
        <div className="auth-bg-blob blob2" />
        <div className="auth-card">
          {" "}
          {/* Brand */}{" "}
          <div className="auth-brand">
            <span className="brand-name">luscious</span>
          </div>
          <p className="auth-sub">
            Admin {mode === "login" ? "Portal" : "Registration"}
          </p>{" "}
          {/* Tab toggle */}{" "}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setErrors({});
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErrors({});
              }}
            >
              Register
            </button>
            <div
              className="tab-slider"
              style={{
                transform: `translateX(${mode === "login" ? "0%" : "100%"})`,
              }}
            />
          </div>
          <div className="auth-form">
            {" "}
            {mode === "signup" && (
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  className={`field-input ${errors.name ? "err" : ""}`}
                  placeholder="Gordon Ramsay"
                  value={form.name}
                  onChange={set("name")}
                />{" "}
                {errors.name && <p className="field-err">{errors.name}</p>}{" "}
              </div>
            )}{" "}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                className={`field-input ${errors.email ? "err" : ""}`}
                type="email"
                placeholder="admin@luscious.in"
                value={form.email}
                onChange={set("email")}
              />{" "}
              {errors.email && <p className="field-err">{errors.email}</p>}{" "}
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="pass-wrap">
                <input
                  className={`field-input ${errors.password ? "err" : ""}`}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                />
                <button
                  className="pass-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  type="button"
                >
                  {" "}
                  {showPass ? "Hide" : "Show"}{" "}
                </button>
              </div>{" "}
              {errors.password && (
                <p className="field-err">{errors.password}</p>
              )}{" "}
            </div>{" "}
            {mode === "signup" && (
              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <input
                  className={`field-input ${errors.confirm ? "err" : ""}`}
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={set("confirm")}
                />{" "}
                {errors.confirm && (
                  <p className="field-err">{errors.confirm}</p>
                )}{" "}
              </div>
            )}{" "}
            {mode === "login" && (
              <div className="forgot-row">
                <button className="forgot-btn">Forgot password?</button>
              </div>
            )}{" "}
            <button
              className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {" "}
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "Sign In to Admin"
              ) : (
                "Create Admin Account"
              )}{" "}
            </button>
          </div>
          <p className="auth-footer">
            {" "}
            {mode === "login" ? "New here? " : "Already have an account? "}{" "}
            <button
              className="switch-btn"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErrors({});
              }}
            >
              {" "}
              {mode === "login" ? "Register" : "Sign In"}{" "}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
const styles = ` @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } .auth-page { min-height: 100vh; background: #0f0d09; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; padding: 24px; position: relative; overflow: hidden; } .auth-bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; pointer-events: none; } .blob1 { width: 500px; height: 500px; background: #e8773a; top: -150px; right: -100px; animation: blobDrift 8s ease-in-out infinite alternate; } .blob2 { width: 400px; height: 400px; background: #d4a86a; bottom: -120px; left: -80px; animation: blobDrift 10s ease-in-out infinite alternate-reverse; } @keyframes blobDrift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px, 20px) scale(1.08); } } .auth-card { background: #1a1610; border: 1px solid #2e2820; border-radius: 24px; padding: 44px 40px 36px; width: 100%; max-width: 420px; position: relative; z-index: 1; box-shadow: 0 40px 80px rgba(0,0,0,0.5); animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1); } @keyframes cardIn { from { opacity:0; transform: translateY(24px) scale(0.97); } to { opacity:1; transform: none; } } .auth-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; } .brand-icon { font-size: 1.6rem; } .brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #f5ede0; font-weight: 700; letter-spacing: -0.02em; } .auth-sub { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #e8773a; margin-bottom: 28px; } .auth-tabs { display: flex; background: #0f0d09; border-radius: 12px; padding: 4px; margin-bottom: 28px; position: relative; } .auth-tab { flex: 1; padding: 10px; background: none; border: none; color: #6a5c48; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; border-radius: 9px; position: relative; z-index: 1; transition: color 0.25s; } .auth-tab.active { color: #1a1208; } .tab-slider { position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px); background: #e8773a; border-radius: 9px; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); z-index: 0; } .auth-form { display: flex; flex-direction: column; gap: 18px; } .field-group { display: flex; flex-direction: column; gap: 6px; } .field-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6a5c48; } .field-input { background: #0f0d09; border: 1.5px solid #2e2820; border-radius: 10px; padding: 12px 16px; color: #f5ede0; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; } .field-input:focus { border-color: #e8773a; box-shadow: 0 0 0 3px rgba(232,119,58,0.12); } .field-input.err { border-color: #e05252; } .field-input::placeholder { color: #3a3228; } .field-err { font-size: 0.73rem; color: #e05252; margin-top: -2px; } .pass-wrap { position: relative; } .pass-wrap .field-input { padding-right: 48px; } .pass-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.6; transition: opacity 0.2s; } .pass-toggle:hover { opacity: 1; } .forgot-row { display: flex; justify-content: flex-end; margin-top: -6px; } .forgot-btn { background: none; border: none; color: #e8773a; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; } .forgot-btn:hover { opacity: 0.7; } .submit-btn { width: 100%; padding: 15px; margin-top: 4px; background: #e8773a; color: #fff; border: none; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s; min-height: 52px; } .submit-btn:hover:not(:disabled) { background: #d4692e; transform: scale(1.02); box-shadow: 0 8px 24px rgba(232,119,58,0.35); } .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; } .submit-btn.loading { background: #2e2820; } .spinner { width: 22px; height: 22px; border: 2.5px solid #3a3228; border-top-color: #e8773a; border-radius: 50%; animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } .auth-footer { text-align: center; font-size: 0.82rem; color: #6a5c48; margin-top: 22px; } .switch-btn { background: none; border: none; color: #e8773a; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; } .switch-btn:hover { opacity: 0.7; } `;
