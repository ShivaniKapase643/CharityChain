import React, { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { shortenHash, shortenAddress } from "../../services/blockchain";

export default function CharityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/charities/my/dashboard")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  if (!data) return <div className="text-center py-20 text-gray-500">No charity found for this account. <a href="/charity/register" className="text-primary-600">Register here.</a></div>;

  const { charity, stats, donations } = data;
  const statusBadge = {
    verified: <span className="badge-verified text-sm">✓ Verified</span>,
    pending: <span className="badge-pending text-sm">⏳ Pending Review</span>,
    rejected: <span className="badge-rejected text-sm">✗ Rejected</span>,
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{charity.name}</h1>
          {statusBadge[charity.verificationStatus]}
        </div>
        <p className="text-gray-500 mt-1">{charity.category}</p>
      </div>

      {/* Verification notice */}
      {charity.verificationStatus === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          ⏳ <strong>Your application is under review.</strong> Admin will verify your charity. Once verified, you can receive donations.
        </div>
      )}
      {charity.verificationStatus === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
          ✗ <strong>Application rejected.</strong> {charity.adminNote || "Contact support for more information."}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Received" value={`${stats.totalAmount?.toFixed(4) || "0"} ETH`} icon="⟠" color="green" />
        <StatCard label="Total Donations" value={stats.totalDonations} icon="💸" color="primary" />
        <StatCard label="Wallet" value={shortenAddress(charity.walletAddress)} icon="🔗" color="teal" />
      </div>

      {/* Charity wallet */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">⛓️ Receiving Wallet</h3>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700 break-all">
          {charity.walletAddress}
        </div>
        <p className="text-xs text-gray-400 mt-2">Donations are sent directly to this wallet via the smart contract.</p>
      </div>

      {/* Donations */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Donation History</h2>
        {donations.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No donations received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Donor</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Transaction Hash</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-b border-gray-50">
                    <td className="py-2 font-mono text-xs">{shortenAddress(d.donorWallet)}</td>
                    <td className="py-2 font-semibold">{d.amount} ETH</td>
                    <td className="py-2 font-mono text-xs text-primary-600">{shortenHash(d.transactionHash)}</td>
                    <td className="py-2 text-xs text-gray-400">{new Date(d.blockTimestamp || d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
