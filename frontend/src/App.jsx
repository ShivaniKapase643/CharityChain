import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import Home from "./pages/Home";
import CharitiesPage from "./pages/CharitiesPage";
import CharityDetailPage from "./pages/CharityDetailPage";
import HowItWorks from "./pages/HowItWorks";
import TransparencyPage from "./pages/TransparencyPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Donor Pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorDonations from "./pages/donor/DonorDonations";
import DonorProfile from "./pages/donor/DonorProfile";

// Charity Pages
import CharityDashboard from "./pages/charity/CharityDashboard";
import CharityProfile from "./pages/charity/CharityProfile";
import CharityDonationsPage from "./pages/charity/CharityDonationsPage";
import CharityRegisterPage from "./pages/charity/CharityRegisterPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCharities from "./pages/admin/AdminCharities";
import AdminDonations from "./pages/admin/AdminDonations";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WalletProvider>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/charities" element={<CharitiesPage />} />
                <Route path="/charities/:id" element={<CharityDetailPage />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/transparency" element={<TransparencyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/charity/register" element={<CharityRegisterPage />} />
              </Route>

              {/* Donor Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["donor"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/donor/dashboard" element={<DonorDashboard />} />
                <Route path="/donor/donations" element={<DonorDonations />} />
                <Route path="/donor/profile" element={<DonorProfile />} />
              </Route>

              {/* Charity Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["charity"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/charity/dashboard" element={<CharityDashboard />} />
                <Route path="/charity/profile" element={<CharityProfile />} />
                <Route path="/charity/donations" element={<CharityDonationsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/charities" element={<AdminCharities />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WalletProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
