import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useWallet } from "../../context/WalletContext";
import { getWriteContract } from "../../services/blockchain";

export default function AdminCharities() {
  const toast = useToast();
  const { signer, account, connect, isCorrectNetwork } = useWallet();

  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [note, setNote] = useState("");

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter });
      if (search) params.set("search", search);
      const res = await api.get(`/admin/charities?${params}`);
      setCharities(res.data.charities || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharities(); }, [filter]);

  /**
   * Approve charity:
   * 1. Call backend to update MongoDB status
   * 2. Call smart contract to record on-chain (if wallet connected)
   */
  const handleApprove = async (charity) => {
    setActionLoading(charity._id);
    try {
      // Step 1: Update database
      await api.put(`/admin/charities/${charity._id}/approve`, { note });

      // Step 2: Record on blockchain (admin calls verifyCharity)
      if (signer && isCorrectNetwork) {
        try {
          const contract = getWriteContract(signer);
          // Register on chain if not already registered
          try {
            const tx = await contract.registerCharity(charity.walletAddress, charity.name);
            await tx.wait(1);
          } catch (regErr) {
            // May fail if already registered — that's fine
            if (!regErr.message?.includes("Already registered")) {
              console.warn("Register on-chain:", regErr.message);
            }
          }
          // Verify on chain
          const tx2 = await contract.verifyCharity(charity.walletAddress);
          await tx2.wait(1);
          toast.success(`${charity.name} approved and verified on blockchain!`);
        } catch (chainErr) {
          console.warn("Blockchain verification failed:", chainErr.message);
          toast.warning(`${charity.name} approved in database. Blockchain tx failed: ${chainErr.message}`);
        }
      } else {
        toast.success(`${charity.name} approved in database. Connect admin wallet to also record on-chain.`);
      }

      fetchCharities();
      setSelectedCharity(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (charity) => {
    setActionLoading(charity._id);
    try {
      await api.put(`/admin/charities/${charity._id}/reject`, { reason: note || "Application rejected" });

      // Optionally reject on-chain too
      if (signer && isCorrectNetwork) {
        try {
          const contract = getWriteContract(signer);
          const tx = await contract.rejectCharity(charity.walletAddress);
          await tx.wait(1);
        } catch { /* may not be registered yet */ }
      }

      toast.success(`${charity.name} rejected`);
      fetchCharities();
      setSelectedCharity(null);
    } catch (err) {
      toast.error("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Charities</h1>
        <p className="text-gray-500 mt-1">Review, approve, or reject charity applications</p>
      </div>

      {/* Admin wallet notice */}
      {!account ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-blue-800">Connect admin wallet to record approvals on the blockchain smart contract.</p>
          <button onClick={connect} className="btn-primary text-sm">Connect Wallet</button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-sm text-green-800">
          ✅ Admin wallet connected — blockchain operations enabled.
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["pending", "verified", "rejected", ""].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${filter === s ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s || "All"}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchCharities()}
          className="input ml-auto max-w-xs text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : charities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No charities found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {charities.map((c) => (
            <div key={c._id} className="card">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.verificationStatus === "verified" ? "bg-green-100 text-green-700" :
                      c.verificationStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {c.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{c.category} • {c.email}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <span>📧 {c.email}</span>
                    <span>🌐 {c.website || "—"}</span>
                    <span className="font-mono col-span-2">🔗 {c.walletAddress}</span>
                    {c.verificationMetadata?.documentType && (
                      <span>📄 {c.verificationMetadata.documentType}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {c.verificationStatus === "pending" && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      onClick={() => { setSelectedCharity(c); setNote(""); }}
                      className="btn-primary text-sm py-2"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedCharity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Review Charity</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedCharity.name}</p>

            <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-1 mb-4">
              <div><strong>Category:</strong> {selectedCharity.category}</div>
              <div><strong>Email:</strong> {selectedCharity.email}</div>
              <div><strong>Wallet:</strong> <span className="font-mono">{selectedCharity.walletAddress}</span></div>
              <div><strong>Document:</strong> {selectedCharity.verificationMetadata?.documentType}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (optional)</label>
              <textarea
                rows={2}
                className="input resize-none text-sm"
                placeholder="Notes visible to charity..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedCharity)}
                disabled={!!actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === selectedCharity._id ? "Processing..." : "✅ Approve"}
              </button>
              <button
                onClick={() => handleReject(selectedCharity)}
                disabled={!!actionLoading}
                className="flex-1 btn-danger"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => setSelectedCharity(null)}
                className="px-4 py-2.5 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Approval will update the database AND record on-chain (if wallet connected).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
