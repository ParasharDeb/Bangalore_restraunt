"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/orderFlow";

export default function SigninPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(username, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/menu");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignin();
    }
  };

  return (
    <div className="signin-container">
      <style>{signInStyles}</style>
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">Admin Login</h1>
          <p className="signin-subtitle">Access your kitchen dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className="signin-input"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="signin-input"
          />
        </div>

        <button
          className="signin-button"
          type="button"
          onClick={handleSignin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="signin-footer">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="signup-link">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

const signInStyles = `
  .signin-container {
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #0f0d09 0%, #1a1610 100%);
    font-family: 'DM Sans', sans-serif;
  }
  .signin-card {
    background: rgba(26, 22, 16, 0.9);
    border: 1px solid #2e2820;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }
  .signin-header { text-align: center; margin-bottom: 30px; }
  .signin-title { font-size: 1.8rem; font-weight: 800; color: #f5ede0; margin: 0 0 8px; }
  .signin-subtitle { font-size: 0.9rem; color: #a38c79; margin: 0; }
  .error-message {
    background: rgba(204, 51, 51, 0.2);
    border: 1px solid #c33;
    color: #ff8888;
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
  }
  .input-group { margin-bottom: 20px; }
  .input-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #e8773a;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .signin-input {
    width: 100%;
    padding: 12px 15px;
    background: #0f0d09;
    border: 1px solid #2e2820;
    border-radius: 8px;
    color: #f5ede0;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .signin-button {
    width: 100%;
    padding: 12px;
    background: #e8773a;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 10px;
  }
  .signin-button:disabled { opacity: 0.7; cursor: not-allowed; }
  .signin-footer { text-align: center; font-size: 0.9rem; color: #a38c79; margin: 20px 0 0; }
  .signup-link { color: #e8773a; text-decoration: none; font-weight: 600; }
`;
