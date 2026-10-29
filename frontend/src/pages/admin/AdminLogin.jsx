import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { loginAdmin, getCurrentAdmin } from "../../services/authApi";

import "../../styles/admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);

      // Verify the session cookie with the backend
      await getCurrentAdmin();

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <Link to="/" className="admin-back-link">
        <ArrowLeft size={16} />
        <span>Back to portfolio</span>
      </Link>

      <section className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-brand-icon">
            <LockKeyhole size={25} strokeWidth={1.7} />
          </div>

          <span className="admin-brand-label">PORTFOLIO CONTROL</span>
        </div>

        <div className="admin-login-heading">
          <h1>Welcome back.</h1>
          <p>Sign in to manage your portfolio, projects and messages.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label htmlFor="admin-email">Email address</label>

            <div className="admin-input-wrap">
              <Mail size={18} />

              <input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>

            <div className="admin-input-wrap">
              <LockKeyhole size={18} />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="admin-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="admin-security-note">
          <ShieldCheck size={16} />
          <span>Secure administrator access</span>
        </div>
      </section>

      <p className="admin-login-footer">
        Private Dashboard · Authorized Access Only
      </p>
    </main>
  );
}
