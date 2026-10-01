import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { donateToCharity, getExplorerUrl, shortenHash } from "../services/blockchain";
import api from "../services/api";

/**
 * DonationModal — handles the complete donation flow:
 * 1. Validate amount
 * 2. Connect wallet if not connected
 * 3. Send tx via MetaMask
 * 4. Wait for confirmation
 * 5. Record in backend
 * 6. Show success with tx hash
 */
export default function DonationModal({ charity, onClose }) {
  const { signer, account, chainId, isCorrectNetwork, connect, networkDisplayName, switchToCorrectNetwork } = useWallet();
  const { user } = useAuth();
  const toast = useToast();

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input"); // input | confirming | success | error
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const explorerUrl = txHash ? getExplorerUrl(txHash, chainId) : null;

  const handleDonate = async () => {
    // Validation
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    if (parseFloat(amount) < 0.0001) {
      toast.error("Minimum donation is 0.0001 ETH");
      return;
    }

    // Wallet connection check
    if (!account) {
      const connected = await connect();
      if (!connected) return;
    }

    // Network check
    if (!isCorrectNetwork) {
      toast.error("Please switch to the correct network in MetaMask");
      return;
    }

    if (charity.verificationStatus !== "verified") {
      toast.error("This charity is not verified. Donations are not allowed.");
      return;
    }

    setStep("confirming");
    setErrorMsg("");

    try {
      // Step 1: Send blockchain transaction
      const result = await donateToCharity(signer, charity.walletAddress, amount);

      setTxHash(result.transactionHash);

      // Step 2: Record in backend
      try {
        await api.post("/donations", {
          transactionHash: result.transactionHash,
          charityId: charity._id,
          charityWallet: charity.walletAddress,
          donorWallet: account,
          amount: amount,
          amountWei: result.amountWei,
          blockNumber: result.blockNumber,
          chainId: chainId,
          network: chainId === 31337 ? "localhost" : "sepolia",
        });
      } catch (backendError) {
        // Backend record failure should not block the success screen
        // The blockchain transaction already succeeded
        console.warn("Backend record failed:", backendError.message);
        toast.warning("Donation sent! (Backend record may be delayed)");
      }

      setStep("success");
    } catch (err) {
      console.error("Donation error:", err);
      setStep("error");

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMsg("Transaction rejected in MetaMask.");
      } else if (err.message?.includes("insufficient funds")) {
        setErrorMsg("Insufficient funds in your wallet.");
      } else if (err.message?.includes("Charity not verified")) {
        setErrorMsg("This charity is not verified on-chain.");
      } else if (err.message?.includes("network")) {
        setErrorMsg("Network error. Please check your connection.");
      } else {
        setErrorMsg(err.message || "Transaction failed. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Donate to {charity.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* ── INPUT STEP ── */}
          {step === "input" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <span className="badge-verified">✓ Verified Charity</span>
                <span className="text-xs text-gray-600">Verified by admin</span>
              </div>

              {!account && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3">
                  ⚠️ Connect your MetaMask wallet to donate.
                </div>
              )}

              {account && !isCorrectNetwork && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 flex items-center justify-between gap-3">
                  <span>⚠️ Wrong network. Switch to <strong>{networkDisplayName}</strong> to donate.</span>
                  <button onClick={switchToCorrectNetwork} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg whitespace-nowrap">
                    Switch
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Amount (ETH)
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="0.001"
                  placeholder="e.g. 0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum: 0.0001 ETH (test funds only)</p>
              </div>

              {/* Charity wallet */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono">
                <span className="text-gray-400 block mb-1">Charity wallet:</span>
                {charity.walletAddress}
              </div>

              <button
                onClick={handleDonate}
                className="btn-primary w-full"
              >
                {account ? "Donate via MetaMask" : "Connect Wallet & Donate"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                This transaction will be recorded on the blockchain.
                Funds go directly to the charity's wallet.
              </p>
            </div>
          )}

          {/* ── CONFIRMING STEP ── */}
          {step === "confirming" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="font-semibold text-gray-900">Processing Donation</h3>
              <p className="text-sm text-gray-600">
                Please confirm the transaction in MetaMask, then wait for blockchain confirmation...
              </p>
              <p className="text-xs text-gray-400">Do not close this window.</p>
            </div>
          )}

          {/* ── SUCCESS STEP ── */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✅
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Donation Successful!</h3>
              <p className="text-sm text-gray-600">
                Your donation of <strong>{amount} ETH</strong> to{" "}
                <strong>{charity.name}</strong> has been recorded on the blockchain.
              </p>

              {/* Transaction Hash */}
              <div className="bg-gray-50 rounded-lg p-3 text-left">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                <p className="text-xs font-mono text-gray-700 break-all">{txHash}</p>
              </div>

              {explorerUrl ? (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full block text-center"
                >
                  View on Blockchain Explorer ↗
                </a>
              ) : (
                <div className="bg-blue-50 text-blue-700 text-xs rounded-lg p-3">
                  ℹ️ Using local Hardhat network — no external explorer available.
                  Your transaction hash: {shortenHash(txHash)}
                </div>
              )}

              <button onClick={onClose} className="btn-primary w-full">
                Done
              </button>
            </div>
          )}

          {/* ── ERROR STEP ── */}
          {step === "error" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto">
                ❌
              </div>
              <h3 className="font-semibold text-gray-900">Donation Failed</h3>
              <p className="text-sm text-red-600">{errorMsg}</p>
              <button
                onClick={() => setStep("input")}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button onClick={onClose} className="text-sm text-gray-500 w-full">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
