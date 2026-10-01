import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import HomePage from "./pages/public/HomePage";
import CharitiesPage from "./pages/public/CharitiesPage";
import CharityDetailPage from "./pages/public/CharityDetailPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import TransparencyPage from "./pages/public/TransparencyPage";
import AboutPage from "./pages/public/AboutPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Donor pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorDonations from "./pages/donor/DonorDonations";
import DonorProfile from "./pages/donor/DonorProfile";

// Charity pages
import CharityDashboard from "./pages/charity/CharityDashboard";
import CharityProfile from "./pages/charity/CharityProfile";
import CharityDonationsPage from "./pages/charity/CharityDonationsPage";
import CharityRegisterPage from "./pages/charity/CharityRegisterPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCharities from "./pages/admin/AdminCharities";
import AdminDonations from "./pages/admin/AdminDonations";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WalletProvider>
            <Routes>
              {/* ── Public routes ─────────────────────────────────────── */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/charities" element={<CharitiesPage />} />
                <Route path="/charities/:id" element={<CharityDetailPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/transparency" element={<TransparencyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* ── Donor routes ──────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute roles={["donor"]}>
                    <DashboardLayout role="donor" />
                  </ProtectedRoute>
                }
              >
                <Route path="/donor/dashboard" element={<DonorDashboard />} />
                <Route path="/donor/donations" element={<DonorDonations />} />
                <Route path="/donor/profile" element={<DonorProfile />} />
              </Route>

              {/* ── Charity routes ────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute roles={["charity"]}>
                    <DashboardLayout role="charity" />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/charity/dashboard"
                  element={<CharityDashboard />}
                />
                <Route path="/charity/profile" element={<CharityProfile />} />
                <Route
                  path="/charity/donations"
                  element={<CharityDonationsPage />}
                />
                <Route
                  path="/charity/register"
                  element={<CharityRegisterPage />}
                />
              </Route>

              {/* ── Admin routes ──────────────────────────────────────── */}
              <Route
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <DashboardLayout role="admin" />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/charities" element={<AdminCharities />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WalletProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
