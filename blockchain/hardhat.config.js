require("@nomicfoundation/hardhat-toolbox");

// Load .env from the blockchain folder itself first,
// then fall back to the project root .env
require("dotenv").config();                        // blockchain/.env (if present)
require("dotenv").config({ path: "../.env" });     // project root .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ── Local Hardhat node (default for development) ──────────────
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // ── Sepolia public testnet ─────────────────────────────────────
    // Set in environment:
    //   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
    //   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
