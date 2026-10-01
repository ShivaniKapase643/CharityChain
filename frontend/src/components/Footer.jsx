import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⛓️</span>
              <span className="text-white font-bold text-lg">CharityChain</span>
            </div>
            <p className="text-sm leading-relaxed">
              A blockchain-based transparent charity donation platform. All donation
              records are publicly verifiable on-chain.
            </p>
            <p className="text-xs mt-3 text-yellow-500">
              ⚠️ Academic demo project. Uses testnet only. Not real funds.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/charities" className="hover:text-white transition-colors">Browse Charities</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/transparency" className="hover:text-white transition-colors">Transparency</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register as Donor</Link></li>
              <li><Link to="/charity/register" className="hover:text-white transition-colors">Register Charity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Technology</h4>
            <ul className="space-y-2 text-sm">
              <li>Ethereum (Hardhat Testnet)</li>
              <li>Solidity Smart Contract</li>
              <li>React + Vite + Tailwind</li>
              <li>Node.js + MongoDB</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          <p>© 2024 CharityChain — Academic Mini Project. All charities marked (DEMO) are fictional sample data.</p>
          <p className="mt-1">
            Smart contract data is publicly verifiable. Administrative verification is required for charities — blockchain alone does not guarantee legitimacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
