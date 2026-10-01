/**
 * Utility formatting helpers
 */

/**
 * Shorten an Ethereum address: 0x1234...ABCD
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Shorten a transaction hash: 0x1234...ABCD
 */
export function shortenHash(hash, chars = 6) {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Format ETH amount with up to 6 decimal places.
 */
export function formatEth(amount) {
  const n = parseFloat(amount);
  if (isNaN(n)) return "0 ETH";
  return `${n.toFixed(n < 0.01 ? 6 : 4)} ETH`;
}

/**
 * Format a Date or timestamp to readable string.
 */
export function formatDate(dateOrTimestamp) {
  if (!dateOrTimestamp) return "—";
  const date =
    typeof dateOrTimestamp === "number"
      ? new Date(dateOrTimestamp * 1000) // Unix seconds
      : new Date(dateOrTimestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate blockchain explorer URL for a transaction hash.
 * Dynamically based on chain ID.
 */
export function getExplorerUrl(txHash, chainId) {
  if (!txHash) return "#";
  const explorers = {
    11155111: "https://sepolia.etherscan.io/tx/",
    1: "https://etherscan.io/tx/",
    // 31337 = local Hardhat — no public explorer
  };
  const base = explorers[chainId];
  if (!base) return "#"; // Local node has no explorer
  return `${base}${txHash}`;
}

/**
 * Get category badge color classes.
 */
export function getCategoryColor(category) {
  const map = {
    Education: "bg-blue-100 text-blue-700",
    Health: "bg-rose-100 text-rose-700",
    Environment: "bg-green-100 text-green-700",
    "Food Relief": "bg-orange-100 text-orange-700",
    "Disaster Relief": "bg-red-100 text-red-700",
    "Animal Welfare": "bg-purple-100 text-purple-700",
    "Community Development": "bg-teal-100 text-teal-700",
    Other: "bg-slate-100 text-slate-700",
  };
  return map[category] || "bg-slate-100 text-slate-700";
}
