import React from "react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How CharityChain Works</h1>
        <p className="text-gray-600 text-lg">A transparent, blockchain-powered donation system</p>
      </div>

      {/* Architecture */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Architecture</h2>
        <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm text-gray-600">
          <pre className="whitespace-pre-wrap">{`
  DONOR / CHARITY / ADMIN
         ↓
  React Frontend (Vite)
  ├── Connects to MetaMask
  └── Calls Backend API
         ↓
  ┌──────────────┬────────────────┐
  │   Node.js    │    MetaMask    │
  │   Express    │    Wallet      │
  │   Backend    │       ↓        │
  │      ↓       │  Ethers.js     │
  │   MongoDB    │       ↓        │
  │  (off-chain) │  Smart Contract│
  │              │  on Hardhat    │
  └──────────────┴────────────────┘
          `.trim()}</pre>
        </div>
      </div>

      {/* Donation Flow */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Flow (Step by Step)</h2>
        <div className="space-y-4">
          {[
            { n: 1, title: "Open a verified charity", desc: "Browse and select a charity with the green Verified badge." },
            { n: 2, title: "Connect MetaMask", desc: "Click 'Connect Wallet'. MetaMask prompts for permission. No private keys are shared." },
            { n: 3, title: "Enter amount", desc: "Enter how much test ETH you want to donate. Minimum is 0.0001 ETH." },
            { n: 4, title: "MetaMask opens", desc: "Review the transaction details in MetaMask and click Confirm." },
            { n: 5, title: "Smart contract executes", desc: "The CharityDonation.sol contract validates the charity is verified, then sends funds directly to the charity wallet." },
            { n: 6, title: "Transaction confirmed", desc: "The transaction is mined and included in a block." },
            { n: 7, title: "Transaction hash received", desc: "You get a unique hash like 0x82A3...91F2 that proves your donation on the blockchain." },
            { n: 8, title: "Backend records it", desc: "The frontend sends the transaction details to the backend which saves an application record in MongoDB." },
            { n: 9, title: "View donation history", desc: "Your donation appears in your donor dashboard with the transaction hash." },
          ].map((s) => (
            <div key={s.n} className="flex gap-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {s.n}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ Important Clarification</h3>
        <p className="text-sm text-yellow-800 leading-relaxed">
          <strong>Blockchain does NOT automatically make a charity genuine or trustworthy.</strong>
          CharityChain uses an administrator verification process to review charity applications.
          Only charities that have been reviewed and approved receive the "Verified" badge.
          Blockchain provides a transparent and tamper-resistant record of donation transactions —
          it is the verification mechanism (admin review) that determines whether a charity is legitimate.
        </p>
      </div>

      <div className="text-center">
        <Link to="/charities" className="btn-primary text-lg px-10 py-3">
          Browse Verified Charities →
        </Link>
      </div>
    </div>
  );
}
