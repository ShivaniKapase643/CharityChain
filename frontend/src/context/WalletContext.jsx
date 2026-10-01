import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const WalletContext = createContext(null);

// Read from environment — set VITE_NETWORK_CHAIN_ID in .env
// LOCAL:      31337  (Hardhat)
// PRODUCTION: 11155111 (Sepolia)
const REQUIRED_CHAIN_ID = parseInt(import.meta.env.VITE_NETWORK_CHAIN_ID || "31337");

// Network metadata per chain ID — used when prompting MetaMask to add network
const NETWORK_CONFIG = {
  31337: {
    chainName: "Hardhat Local",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
  },
  11155111: {
    chainName: "Sepolia Testnet",
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

const NETWORK_DISPLAY_NAME = import.meta.env.VITE_NETWORK_NAME || (
  REQUIRED_CHAIN_ID === 11155111 ? "Sepolia Testnet" : "Hardhat Local"
);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === REQUIRED_CHAIN_ID;

  // Re-connect if previously connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          initProvider();
        }
      });

      // Listen for account/chain changes
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0].toLowerCase());
    }
  };

  const handleChainChanged = () => {
    // Reload on chain change as recommended by MetaMask
    window.location.reload();
  };

  const initProvider = async () => {
    const web3Provider = new BrowserProvider(window.ethereum);
    const web3Signer = await web3Provider.getSigner();
    const address = await web3Signer.getAddress();
    const network = await web3Provider.getNetwork();

    setProvider(web3Provider);
    setSigner(web3Signer);
    setAccount(address.toLowerCase());
    setChainId(Number(network.chainId));
  };

  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to use this feature.");
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await initProvider();
      return true;
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected. Please approve MetaMask connection.");
      } else {
        setError("Failed to connect wallet: " + err.message);
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  /**
   * Ask MetaMask to switch to the required network.
   * If the network is not added in MetaMask, adds it automatically
   * using the correct RPC and explorer URLs for the configured chain.
   */
  const switchToCorrectNetwork = async () => {
    const hexChainId = `0x${REQUIRED_CHAIN_ID.toString(16)}`;
    const netConfig = NETWORK_CONFIG[REQUIRED_CHAIN_ID];

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      // Error 4902 = network not added in MetaMask — add it
      if (err.code === 4902 && netConfig) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: netConfig.chainName,
                nativeCurrency: netConfig.nativeCurrency,
                rpcUrls: netConfig.rpcUrls,
                blockExplorerUrls: netConfig.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          setError("Failed to add network: " + addError.message);
        }
      } else {
        setError("Failed to switch network: " + err.message);
      }
    }
  };

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
        requiredChainId: REQUIRED_CHAIN_ID,
        networkDisplayName: NETWORK_DISPLAY_NAME,
        connect,
        disconnect,
        switchToCorrectNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
