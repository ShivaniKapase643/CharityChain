import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import DonationModal from "../components/DonationModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { shortenHash, shortenAddress } from "../services/blockchain";

export default function CharityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charity, setCharity] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get(`/charities/${id}`)
      .then((r) => {
        setCharity(r.data.charity);
        setDonations(r.data.recentDonations || []);
      })
      .catch(() => navigate("/charities"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!charity) return null;

  const isVerified = charity.verificationStatus === "verified";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-primary-600 mb-6 flex items-center gap-1"
      >
        ← Back to Charities
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Charity Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Header */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{charity.name}</h1>
                  {isVerified ? (
                    <span className="badge-verified">✓ Verified</span>
                  ) : charity.verificationStatus === "pending" ? (
                    <span className="badge-pending">⏳ Pending Review</span>
                  ) : (
                    <span className="badge-rejected">✗ Rejected</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{charity.category}</div>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline mt-1 block">
                    🌐 {charity.website}
                  </a>
                )}
              </div>
            </div>

            <p className="text-gray-700 mt-4 text-sm leading-relaxed">{charity.description}</p>

            {/* Contact */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
              {charity.email && <div>📧 {charity.email}</div>}
              {charity.phone && <div>📞 {charity.phone}</div>}
              {charity.address?.city && (
                <div>📍 {charity.address.city}, {charity.address.country}</div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">⛓️ Blockchain Wallet Address</h3>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 break-all">
              {charity.walletAddress}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This is the Ethereum address that receives donations directly via the smart contract.
            </p>
          </div>

          {/* Recent Donations */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Donations (On-Chain)</h3>
            {donations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No donations recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="pb-2">Donor</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Transaction Hash</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-mono">{shortenAddress(d.donorWallet)}</td>
                        <td className="py-2 font-semibold">{d.amount} ETH</td>
                        <td className="py-2 font-mono text-primary-600">{shortenHash(d.transactionHash)}</td>
                        <td className="py-2 text-gray-400">
                          {new Date(d.blockTimestamp || d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Donate Panel */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Donation Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Raised</span>
                <span className="font-bold text-gray-900">{charity.totalDonations?.toFixed(4) || "0"} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Donors</span>
                <span className="font-bold text-gray-900">{charity.totalDonors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-semibold ${isVerified ? "text-green-600" : "text-yellow-600"}`}>
                  {charity.verificationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Donate */}
          <div className="card">
            {isVerified ? (
              <>
                <h3 className="font-semibold text-gray-900 mb-2">Make a Donation</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Donations are sent directly to the charity's wallet via the smart contract.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary w-full"
                >
                  Donate Now
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">⏳</div>
                <h3 className="font-semibold text-gray-700 text-sm">Not Accepting Donations</h3>
                <p className="text-xs text-gray-400 mt-1">
                  This charity is not yet verified. Donations are only enabled for verified charities.
                </p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
            ℹ️ <strong>Verification Note:</strong> Administrative review is used to identify
            verified charities. The verification badge does not guarantee the charity is
            legitimate — it means an admin has reviewed the application.
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showModal && (
        <DonationModal
          charity={charity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
