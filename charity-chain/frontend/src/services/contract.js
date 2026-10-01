/**
 * contract.js
 * Ethers.js wrapper for the CharityDonation smart contract.
 * Used from the frontend to read state and send donations.
 *
 * IMPORTANT:
 *  - Donations (write operations) require a signer from MetaMask.
 *  - Read-only queries can use a provider without a signer.
 *  - Never store private keys in the frontend.
 */

import { ethers } from "ethers";
import CharityDonationABI from "../contracts/CharityDonation.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * Get a read-only contract instance (no wallet needed).
 */
export function getReadContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CharityDonationABI.abi, provider);
}

/**
 * Get a writable contract instance (requires connected signer).
 * @param {ethers.Signer} signer — from WalletContext
 */
export function getWriteContract(signer) {
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(CONTRACT_ADDRESS, CharityDonationABI.abi, signer);
}

/**
 * Donate ETH to a verified charity.
 * Returns the transaction receipt.
 *
 * @param {ethers.Signer} signer
 * @param {string} charityWallet  — charity's ETH address
 * @param {string} amountEth      — donation amount as string e.g. "0.05"
 */
export async function donateToCharity(signer, charityWallet, amountEth) {
  const contract = getWriteContract(signer);
  const amountWei = ethers.parseEther(amountEth);

  // Send transaction — MetaMask popup appears here
  const tx = await contract.donate(charityWallet, { value: amountWei });

  // Wait for 1 confirmation
  const receipt = await tx.wait(1);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    receipt,
  };
}

/**
 * Check if a charity is verified on-chain.
 * @param {string} charityWallet
 */
export async function isCharityVerifiedOnChain(charityWallet) {
  try {
    const contract = getReadContract();
    return await contract.isVerified(charityWallet);
  } catch {
    return false;
  }
}

/**
 * Get charity on-chain stats.
 */
export async function getCharityOnChain(charityWallet) {
  try {
    const contract = getReadContract();
    const result = await contract.getCharity(charityWallet);
    return {
      walletAddress: result[0],
      status: Number(result[1]),
      totalReceived: ethers.formatEther(result[2]),
      donationCount: Number(result[3]),
    };
  } catch {
    return null;
  }
}

/**
 * Get total donations count from chain.
 */
export async function getTotalDonationsOnChain() {
  try {
    const contract = getReadContract();
    const total = await contract.totalDonations();
    return Number(total);
  } catch {
    return 0;
  }
}
