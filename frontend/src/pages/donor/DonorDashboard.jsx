import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { shortenAddress, shortenHash } from "../../services/blockchain";
import StatCard from "../../components/StatCard";

export default function DonorDashboard() {
  const { user } = useAuth();
  const { account, connect, isConnecting } = useWallet();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (account) {
      fetchDonations();
    }
  }, [account]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations?wallet=${account}`);
      setDonations(res.data.donations || []);
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    const ok = await connect();
    if (ok) toast.success("Wallet connected!");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Wallet connection */}
      {!account ? (
        <div className="card mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect MetaMask to view your donation history and make donations.
            </p>
          </div>
          <button onClick={handleConnect} disabled={isConnecting} className="btn-primary whitespace-nowrap">
            {isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <span className="w-3 h-3 bg-green-500 rounded-full" />
          <div>
            <span className="text-sm font-medium text-green-800">Wallet Connected</span>
            <span className="text-xs text-green-600 font-mono ml-2">{shortenAddress(account)}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Donated" value={`${totalAmount.toFixed(4)} ETH`} icon="⟠" color="primary" />
        <StatCard label="Donations Made" value={donations.length} icon="💸" color="green" />
        <StatCard label="Charities Supported" value={new Set(donations.map(d => d.charityId?._id)).size} icon="🏢" color="teal" />
      </div>

      {/* Donation History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Donations</h2>
          <Link to="/donor/donations" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>

        {!account ? (
          <p className="text-center text-gray-400 py-8 text-sm">Connect your wallet to view donations.</p>
        ) : loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>
        ) : donations.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-gray-500 text-sm">No donations yet.</p>
            <Link to="/charities" className="btn-primary text-sm mt-4 inline-block">Browse Charities</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Charity</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Tx Hash</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 5).map((d) => (
                  <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">{d.charityId?.name || "Unknown"}</td>
                    <td className="py-2 font-semibold">{d.amount} ETH</td>
                    <td className="py-2 font-mono text-xs text-primary-600">{shortenHash(d.transactionHash)}</td>
                    <td className="py-2 text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Confirmed</span>
                    </td>
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
