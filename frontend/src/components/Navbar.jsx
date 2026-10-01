import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { shortenAddress } from "../services/blockchain";

export default function Navbar() {
  const { user, logout } = useAuth();
  const {
    account,
    connect,
    disconnect,
    isConnecting,
    isCorrectNetwork,
    networkDisplayName,
    switchToCorrectNetwork,
  } = useWallet();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "charity") return "/charity/dashboard";
    return "/donor/dashboard";
  };

  return (
    <>
      {/* Wrong network banner */}
      {account && !isCorrectNetwork && (
        <div className="bg-red-600 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-3">
          <span>⚠️ Wrong network detected. Please switch to <strong>{networkDisplayName}</strong> in MetaMask.</span>
          <button
            onClick={switchToCorrectNetwork}
            className="bg-white text-red-600 font-semibold px-3 py-0.5 rounded-full hover:bg-red-50 transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">⛓️</span>
              <span className="text-xl font-bold text-primary-700">CharityChain</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/charities" className="hover:text-primary-600 transition-colors">
                Charities
              </Link>
              <Link to="/how-it-works" className="hover:text-primary-600 transition-colors">
                How It Works
              </Link>
              <Link to="/transparency" className="hover:text-primary-600 transition-colors">
                Transparency
              </Link>
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Wallet */}
              {account ? (
                <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${
                  isCorrectNetwork
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${isCorrectNetwork ? "bg-green-500" : "bg-red-500"}`} />
                  {shortenAddress(account)}
                </div>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardLink()}
                    className="text-sm bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-500 font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-primary-600 font-medium px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <Link to="/charities" className="block text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Charities</Link>
            <Link to="/how-it-works" className="block text-gray-700 py-2" onClick={() => setMenuOpen(false)}>How It Works</Link>
            <Link to="/transparency" className="block text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Transparency</Link>
            {account && !isCorrectNetwork && (
              <button onClick={switchToCorrectNetwork} className="block text-red-600 font-medium py-2 w-full text-left">
                ⚠️ Switch to {networkDisplayName}
              </button>
            )}
            {!account && (
              <button onClick={connect} className="block text-primary-600 font-medium py-2 w-full text-left">
                🦊 Connect Wallet
              </button>
            )}
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block text-primary-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block text-red-500 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-primary-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
