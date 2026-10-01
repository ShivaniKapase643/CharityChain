import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { shortenHash, shortenAddress } from "../../services/blockchain";

export default function CharityDonationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/charities/my/dashboard").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Donations Received</h1>
      {!data?.donations?.length ? (
        <div className="text-center py-16 card">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-gray-500">No donations received yet.</p>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">All Donations</h2>
            <span className="text-sm text-gray-500">{data.donations.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Donor Wallet</th>
                  <th className="pb-2">Amount (ETH)</th>
                  <th className="pb-2">Transaction Hash</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.donations.map((d) => (
                  <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs">{shortenAddress(d.donorWallet)}</td>
                    <td className="py-2 font-bold">{d.amount}</td>
                    <td className="py-2 font-mono text-xs text-primary-600">{shortenHash(d.transactionHash)}</td>
                    <td className="py-2 text-xs text-gray-400">{new Date(d.blockTimestamp || d.createdAt).toLocaleString()}</td>
                    <td className="py-2"><span className="badge-verified text-xs">Confirmed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
