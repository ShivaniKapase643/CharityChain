import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);

      // Redirect to intended page or role dashboard
      const destination = from || (
        res.data.user.role === "admin" ? "/admin/dashboard" :
        res.data.user.role === "charity" ? "/charity/dashboard" :
        "/donor/dashboard"
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">⛓️</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your CharityChain account</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@charitychain.com / Admin@1234<br />
            Donor: donor@charitychain.demo / Donor@1234
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            Registering a charity?{" "}
            <Link to="/charity/register" className="text-primary-600 hover:underline font-medium">
              Apply here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
