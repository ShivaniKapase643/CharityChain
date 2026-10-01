import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

// Expected chain ID (from .env)
const EXPECTED_CHAIN_ID = parseInt(
  import.meta.env.VITE_NETWORK_CHAIN_ID || "31337"
);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === EXPECTED_CHAIN_ID;

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to donate.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const ethSigner = await ethProvider.getSigner();
      const address = await ethSigner.getAddress();
      const network = await ethProvider.getNetwork();

      setProvider(ethProvider);
      setSigner(ethSigner);
      setAccount(address);
      setChainId(Number(network.chainId));
    } catch (err) {
      if (err.code === 4001) {
        setError("MetaMask connection rejected by user.");
      } else {
        setError("Failed to connect wallet: " + err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // Listen for MetaMask account / network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        // Refresh signer
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const ethSigner = await ethProvider.getSigner();
          setSigner(ethSigner);
          setProvider(ethProvider);
        } catch {}
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Auto-connect if previously connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) connectWallet();
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        error,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
