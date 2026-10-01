import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * If roles is provided, also checks role authorization.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const roleHome = {
      donor: "/donor/dashboard",
      charity: "/charity/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={roleHome[user.role] || "/"} replace />;
  }

  return children;
}
