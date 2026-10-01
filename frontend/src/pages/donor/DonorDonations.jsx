import React, { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import api from "../../services/api";
import { shortenHash, shortenAddress, getExplorerUrl } from "../../services/blockchain";

export default function DonorDonations() {
  const { account, chainId } = useWallet();
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setLoading(true);
      api.get(`/donations?wallet=${account}`)
        .then((r) => {
          setDonations(r.data.donations || []);
          setTotalAmount(r.data.totalAmount || 0);
        })
        .finally(() => setLoading(false));
    }
  }, [account]);

  if (!account) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🦊</div>
        <h2 className="text-xl font-semibold text-gray-900">Connect Wallet to View Donations</h2>
        <p className="text-gray-500 mt-2 text-sm">Your donation history is linked to your wallet address.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{shortenAddress(account)}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{donations.length}</div>
          <div className="text-sm text-gray-500">Total Donations</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-700">{totalAmount.toFixed(4)} ETH</div>
          <div className="text-sm text-gray-500">Total Donated</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {new Set(donations.map(d => d.charityId?._id)).size}
          </div>
          <div className="text-sm text-gray-500">Charities Supported</div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">All Donations</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-gray-500">No donations yet. Start by donating to a verified charity!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-3">Charity</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Transaction Hash</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => {
                  const explorerUrl = getExplorerUrl(d.transactionHash, chainId || d.chainId);
                  return (
                    <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium">{d.charityId?.name || "Unknown"}</td>
                      <td className="py-3 text-xs text-gray-500">{d.charityId?.category}</td>
                      <td className="py-3 font-bold text-primary-700">{d.amount} ETH</td>
                      <td className="py-3 font-mono text-xs">
                        <span className="text-gray-600" title={d.transactionHash}>
                          {shortenHash(d.transactionHash)}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-400">
                        {new Date(d.blockTimestamp || d.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        {explorerUrl ? (
                          <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:underline">
                            View ↗
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">Local network</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
