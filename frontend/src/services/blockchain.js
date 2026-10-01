import { Contract, parseEther, formatEther } from "ethers";
import contractData from "../contracts/CharityDonation.json";

/**
 * CONTRACT ADDRESS RESOLUTION (priority order):
 * 1. VITE_CONTRACT_ADDRESS environment variable  ← always wins (set this in prod)
 * 2. address field in CharityDonation.json        ← written by deploy script locally
 * 3. Zero address fallback (contract not deployed yet)
 *
 * For LOCAL dev:  deploy script writes address into CharityDonation.json automatically.
 * For PRODUCTION: set VITE_CONTRACT_ADDRESS in Render frontend env vars.
 */
const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS &&
    import.meta.env.VITE_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000")
    ? import.meta.env.VITE_CONTRACT_ADDRESS
    : (contractData.address &&
       contractData.address !== "0x0000000000000000000000000000000000000000")
      ? contractData.address
      : null;

if (!CONTRACT_ADDRESS) {
  console.warn(
    "⚠️ CharityChain: Contract address not configured. " +
    "Set VITE_CONTRACT_ADDRESS in your .env file or deploy the contract first."
  );
}

/**
 * Get a read-only contract instance (no signer needed).
 */
export function getReadContract(provider) {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  return new Contract(CONTRACT_ADDRESS, contractData.abi, provider);
}

/**
 * Get a write contract instance (signer required for transactions).
 */
export function getWriteContract(signer) {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  return new Contract(CONTRACT_ADDRESS, contractData.abi, signer);
}

/**
 * Donate to a verified charity via the smart contract.
 * @param {object} signer       - Ethers.js signer (from MetaMask)
 * @param {string} charityWallet - Charity's Ethereum address
 * @param {string} amountEth    - Amount in ETH as string, e.g. "0.01"
 * @returns {object} { transactionHash, blockNumber, amountEth, amountWei }
 */
export async function donateToCharity(signer, charityWallet, amountEth) {
  const contract = getWriteContract(signer);

  const amountWei = parseEther(amountEth.toString());
  if (amountWei <= 0n) throw new Error("Donation amount must be greater than 0");

  // This call opens MetaMask for the user to confirm
  const tx = await contract.donate(charityWallet, { value: amountWei });

  // Wait for 1 block confirmation
  const receipt = await tx.wait(1);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    amountEth,
    amountWei: amountWei.toString(),
  };
}

/**
 * Check if a charity is verified on-chain.
 */
export async function isCharityVerifiedOnChain(provider, charityWallet) {
  const contract = getReadContract(provider);
  return contract.isCharityVerified(charityWallet);
}

/**
 * Get on-chain charity details by wallet address.
 */
export async function getCharityOnChain(provider, charityWallet) {
  const contract = getReadContract(provider);
  try {
    const result = await contract.getCharity(charityWallet);
    return {
      walletAddress: result[0],
      name: result[1],
      status: Number(result[2]), // 0=Pending, 1=Verified, 2=Rejected
      totalReceived: formatEther(result[3]),
      donorCount: Number(result[4]),
    };
  } catch {
    return null;
  }
}

/**
 * Get total number of donations recorded on-chain.
 */
export async function getTotalDonationsOnChain(provider) {
  const contract = getReadContract(provider);
  const total = await contract.getTotalDonations();
  return Number(total);
}

/**
 * Build a blockchain explorer URL for a given transaction hash.
 *
 * LOCAL Hardhat (chainId 31337): no public explorer — returns null.
 * Sepolia (chainId 11155111):    returns Etherscan Sepolia link.
 *
 * @param {string} txHash
 * @param {number} chainId
 * @returns {string|null}
 */
export function getExplorerUrl(txHash, chainId) {
  if (!txHash) return null;
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  // Mainnet — not used in this project, but included for completeness
  if (chainId === 1) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  // Local Hardhat node has no public explorer
  return null;
}

/**
 * Get a link to view a contract address on the explorer.
 */
export function getAddressExplorerUrl(address, chainId) {
  if (!address) return null;
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  return null;
}

/**
 * Shorten an Ethereum address for display.
 * 0x1234567890abcdef → 0x1234...cdef
 */
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Shorten a transaction hash for display.
 * 0xabcdef1234567890... → 0xabcdef12...567890
 */
export function shortenHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export { CONTRACT_ADDRESS };
