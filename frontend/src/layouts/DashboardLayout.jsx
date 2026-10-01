import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { shortenAddress } from "../services/blockchain";

const navItems = {
  donor: [
    { label: "Dashboard", to: "/donor/dashboard", icon: "📊" },
    { label: "My Donations", to: "/donor/donations", icon: "💸" },
    { label: "Profile", to: "/donor/profile", icon: "👤" },
  ],
  charity: [
    { label: "Dashboard", to: "/charity/dashboard", icon: "📊" },
    { label: "Donations", to: "/charity/donations", icon: "💸" },
    { label: "Profile", to: "/charity/profile", icon: "🏢" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
    { label: "Charities", to: "/admin/charities", icon: "🏢" },
    { label: "Donations", to: "/admin/donations", icon: "💸" },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { account } = useWallet();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <span
            className="text-xl font-bold text-primary-700 cursor-pointer"
            onClick={() => navigate("/")}
          >
            ⛓️ CharityChain
          </span>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1 capitalize">{user?.role}</div>
          <div className="text-sm font-medium text-gray-800 truncate">{user?.name}</div>
          {account && (
            <div className="text-xs text-primary-600 font-mono mt-1">
              {shortenAddress(account)}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-xs text-red-500 hover:text-red-700 text-left"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="hidden md:block text-sm text-gray-500 capitalize">
            {user?.role} Portal
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
