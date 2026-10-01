import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { shortenHash, shortenAddress, getExplorerUrl } from "../../services/blockchain";

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchDonations = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, page: pg });
      if (search) params.set("wallet", search);
      const res = await api.get(`/admin/donations?${params}`);
      setDonations(res.data.donations || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(page); }, [page]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Donations</h1>
        <p className="text-gray-500 mt-1">{total} total donation records</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by donor wallet address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchDonations(1)}
          className="input max-w-sm"
        />
        <button onClick={() => fetchDonations(1)} className="btn-primary text-sm">Search</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-gray-500">No donations found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3">Donor Wallet</th>
                    <th className="pb-3">Charity</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Transaction Hash</th>
                    <th className="pb-3">Block</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => {
                    const url = getExplorerUrl(d.transactionHash, d.chainId);
                    return (
                      <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 font-mono text-xs">{shortenAddress(d.donorWallet)}</td>
                        <td className="py-2.5 text-xs">{d.charityId?.name || "—"}</td>
                        <td className="py-2.5 font-bold">{d.amount} ETH</td>
                        <td className="py-2.5 font-mono text-xs text-primary-600" title={d.transactionHash}>
                          {shortenHash(d.transactionHash)}
                        </td>
                        <td className="py-2.5 text-xs text-gray-400">{d.blockNumber || "—"}</td>
                        <td className="py-2.5 text-xs text-gray-400">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5">
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                              View ↗
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300">Local</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">Page {page} of {pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
