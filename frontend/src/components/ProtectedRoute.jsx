import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps routes that require authentication and specific roles.
 * Redirects unauthenticated users to /login.
 * Redirects users with wrong role to home.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "charity") return <Navigate to="/charity/dashboard" replace />;
    return <Navigate to="/donor/dashboard" replace />;
  }

  return children;
}
