// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/"); // go to dashboard
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* segmented switch  */}
        <div className="auth-switch">
          <button className="auth-switch-btn auth-switch-btn--active">
            Log In
          </button>
          <Link to="/signup" className="auth-switch-btn">
            Sign Up
          </Link>
        </div>

        <h1 className="auth-title">Welcome back 👋</h1>
        <p className="auth-subtitle">
          Sign in to keep leveling up your StepQuest knight.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button
            className="auth-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <p className="auth-footer-text">
          No account yet?{" "}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
