import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const STEPS = [
  {
    icon: "🔍",
    title: "Browse Verified Charities",
    desc: "Explore charities that have been reviewed and approved by the platform admin.",
  },
  {
    icon: "🦊",
    title: "Connect MetaMask Wallet",
    desc: "Use your MetaMask wallet to donate test ETH securely without sharing any personal data.",
  },
  {
    icon: "⛓️",
    title: "Donate via Smart Contract",
    desc: "Your donation is processed through a Solidity smart contract on the blockchain.",
  },
  {
    icon: "🔎",
    title: "Verify Any Transaction",
    desc: "Every donation generates a transaction hash that anyone can verify on the blockchain.",
  },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    // Fetch basic stats
    api.get("/admin/statistics").then((r) => setStats(r.data.stats)).catch(() => {});
    // Fetch verified charities
    api.get("/charities?status=verified").then((r) => setCharities(r.data.charities?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Running on Ethereum Testnet
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Transparent Giving.{" "}
            <br className="hidden md:block" />
            Verified Charities.{" "}
            <span className="text-teal-300">Blockchain-Powered Trust.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-200 max-w-3xl mx-auto mb-8">
            CharityChain records every donation on a public blockchain, ensuring a
            tamper-resistant record of transactions. Charities are reviewed and approved
            by an administrator before accepting donations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/charities" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Explore Charities →
            </Link>
            <Link to="/how-it-works" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              How It Works
            </Link>
          </div>

          {/* Quick stats */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Verified Charities", value: stats.verifiedCharities },
                { label: "Total Donations", value: stats.totalDonations },
                { label: "Unique Donors", value: stats.totalDonors },
                { label: "ETH Raised", value: stats.totalVolume?.toFixed(3) || "0" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-primary-300 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-600 mt-2">Transparent donations in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BLOCKCHAIN ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Blockchain?</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Tamper-Resistant Records",
                    desc: "Once a donation transaction is written to the blockchain, its record is designed to be tamper-resistant.",
                  },
                  {
                    title: "Public Verifiability",
                    desc: "Anyone can verify any donation using the transaction hash — no trust required.",
                  },
                  {
                    title: "Direct Transfer",
                    desc: "Funds go directly from donor to charity wallet via the smart contract, with no intermediary holding funds.",
                  },
                  {
                    title: "Event Transparency",
                    desc: "The smart contract emits events for every donation, creating a permanent public log.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Important:</strong> Blockchain provides transparent transaction records.
                Charity legitimacy is verified through administrator review — blockchain alone
                does not guarantee a charity is genuine.
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">On-Chain vs Off-Chain</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-primary-700 mb-1">⛓️ STORED ON BLOCKCHAIN</div>
                  {["Donor wallet address", "Charity wallet address", "Donation amount (wei)", "Block timestamp", "Transaction hash", "Smart contract events"].map((item) => (
                    <div key={item} className="text-xs text-gray-600 bg-primary-50 px-3 py-1.5 rounded mb-1">{item}</div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">🗄️ STORED IN DATABASE</div>
                  {["Charity name, description", "Contact info, website", "Verification documents metadata", "User accounts & passwords", "Application metadata"].map((item) => (
                    <div key={item} className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded mb-1">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED CHARITIES ── */}
      {charities.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Verified Charities</h2>
                <p className="text-gray-500 mt-1">Organizations reviewed and approved by our admin team</p>
              </div>
              <Link to="/charities" className="btn-secondary text-sm">View All →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {charities.map((c) => (
                <div key={c._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-lg">🏢</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                      <span className="badge-verified text-xs">✓ Verified</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span>{c.totalDonations?.toFixed(3)} ETH raised</span>
                    <span>{c.totalDonors} donors</span>
                  </div>
                  <Link to={`/charities/${c._id}`} className="mt-3 block text-center btn-primary text-sm py-2">
                    Donate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-primary-700 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-primary-200 mb-8">
            Browse verified charities and make your first blockchain donation today.
            Every transaction is publicly verifiable.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/charities" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Browse Charities
            </Link>
            <Link to="/register" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
