import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { shortenAddress } from "../../services/blockchain";

export default function DonorProfile() {
  const { user, updateUser } = useAuth();
  const { account, connect } = useWallet();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSaveWallet = async () => {
    if (!account) {
      await connect();
      return;
    }
    setSaving(true);
    try {
      const res = await api.put("/auth/update-wallet", { walletAddress: account });
      updateUser({ walletAddress: account });
      toast.success("Wallet address saved to your profile.");
    } catch {
      toast.error("Failed to save wallet address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="card space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Name</label>
          <p className="font-medium text-gray-900 mt-0.5">{user?.name}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
          <p className="font-medium text-gray-900 mt-0.5">{user?.email}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Role</label>
          <p className="font-medium text-gray-900 mt-0.5 capitalize">{user?.role}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Saved Wallet Address</label>
          <p className="font-mono text-sm text-gray-700 mt-0.5">
            {user?.walletAddress || "Not saved"}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">MetaMask Wallet</h3>
          {account ? (
            <div className="flex items-center justify-between">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-mono text-sm text-green-700">
                {shortenAddress(account)}
              </div>
              <button onClick={handleSaveWallet} disabled={saving} className="btn-primary text-sm">
                {saving ? "Saving..." : "Save to Profile"}
              </button>
            </div>
          ) : (
            <button onClick={connect} className="btn-secondary text-sm">
              🦊 Connect MetaMask
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
