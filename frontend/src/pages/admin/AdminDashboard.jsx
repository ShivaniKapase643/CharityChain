import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { shortenHash, shortenAddress } from "../../services/blockchain";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/statistics")
      .then((r) => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Charities" value={stats.totalCharities} icon="🏢" color="primary" />
        <StatCard label="Verified" value={stats.verifiedCharities} icon="✅" color="green" />
        <StatCard label="Pending" value={stats.pendingCharities} icon="⏳" color="yellow" subtitle={stats.pendingCharities > 0 ? "Requires review" : undefined} />
        <StatCard label="Total Donations" value={stats.totalDonations} icon="💸" color="teal" />
        <StatCard label="Unique Donors" value={stats.totalDonors} icon="👥" color="purple" />
        <StatCard label="Volume (ETH)" value={stats.totalVolume?.toFixed(4) || "0"} icon="⟠" color="primary" />
      </div>

      {/* Pending alert */}
      {stats.pendingCharities > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="font-semibold text-yellow-900">⏳ {stats.pendingCharities} charity application{stats.pendingCharities > 1 ? "s" : ""} pending review</span>
          </div>
          <Link to="/admin/charities" className="btn-primary text-sm">Review Now</Link>
        </div>
      )}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Donations by category */}
        {stats.donationsByCategory?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Donations by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.donationsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="ETH" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Charity status pie */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Charity Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Verified", value: stats.verifiedCharities },
                  { name: "Pending", value: stats.pendingCharities },
                  { name: "Rejected", value: stats.rejectedCharities },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {["#22c55e", "#f59e0b", "#ef4444"].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent donations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Donations</h3>
          <Link to="/admin/donations" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        {stats.recentDonations?.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">No donations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Donor</th>
                  <th className="pb-2">Charity</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Tx Hash</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDonations?.map((d) => (
                  <tr key={d._id} className="border-b border-gray-50">
                    <td className="py-2 font-mono text-xs">{shortenAddress(d.donorWallet)}</td>
                    <td className="py-2 text-xs">{d.charityId?.name || "—"}</td>
                    <td className="py-2 font-semibold">{d.amount} ETH</td>
                    <td className="py-2 font-mono text-xs text-primary-600">{shortenHash(d.transactionHash)}</td>
                    <td className="py-2 text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
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
