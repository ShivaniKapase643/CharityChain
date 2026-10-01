import React, { useEffect, useState } from "react";
import api from "../services/api";
import { shortenHash, shortenAddress } from "../services/blockchain";

export default function TransparencyPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/statistics")
      .then((r) => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Transparency Dashboard</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          All donation records on CharityChain are written to the blockchain through smart contracts.
          Blockchain records are publicly verifiable and designed to be tamper-resistant.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-10">
        <h3 className="font-semibold text-primary-900 mb-2">How Blockchain Transparency Works</h3>
        <p className="text-sm text-primary-800 leading-relaxed">
          When a donor sends ETH through CharityChain, the smart contract emits a{" "}
          <code className="bg-primary-100 px-1 rounded">DonationReceived</code> event that is permanently
          stored on the blockchain. Anyone can verify a donation by looking up the transaction hash
          on a blockchain explorer. The transaction hash serves as cryptographic proof that
          the transfer occurred.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading stats...</div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Verified Charities", value: stats.verifiedCharities, icon: "✅" },
            { label: "Total Donations", value: stats.totalDonations, icon: "💸" },
            { label: "Unique Donors", value: stats.totalDonors, icon: "👥" },
            { label: "Total Volume (ETH)", value: stats.totalVolume?.toFixed(4) || "0", icon: "⟠" },
            { label: "Pending Applications", value: stats.pendingCharities, icon: "⏳" },
            { label: "Total Charities", value: stats.totalCharities, icon: "🏢" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Recent Transactions */}
      {stats?.recentDonations?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Donation Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-3">Donor</th>
                  <th className="pb-3">Charity</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Tx Hash</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations.map((d) => (
                  <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs">{shortenAddress(d.donorWallet)}</td>
                    <td className="py-2 text-xs">{d.charityId?.name || "Unknown"}</td>
                    <td className="py-2 font-semibold">{d.amount} ETH</td>
                    <td className="py-2 font-mono text-xs text-primary-600">{shortenHash(d.transactionHash)}</td>
                    <td className="py-2 text-xs text-gray-400">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
        <h3 className="font-semibold text-gray-900 mb-2">Disclaimer</h3>
        <p className="leading-relaxed">
          Statistics shown here are sourced from the platform database (off-chain).
          The authoritative record of each donation is the blockchain transaction.
          Administrative charity verification does not guarantee a charity's legitimacy —
          it indicates the application was reviewed by the platform administrator.
          This is an academic demonstration project running on a test network.
          <strong> No real funds are involved.</strong>
        </p>
      </div>
    </div>
  );
}
