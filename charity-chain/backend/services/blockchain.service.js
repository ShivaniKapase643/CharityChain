/**
 * blockchain.service.js
 * Backend service for calling the smart contract from the server side.
 * Used for admin actions: registerCharity, verifyCharity, rejectCharity.
 *
 * NOTE: This requires DEPLOYER_PRIVATE_KEY in the .env — keep it SECRET.
 *       Never expose this key to the frontend.
 */

const { ethers } = require("ethers");
const path = require("path");

let contractABI, provider, signer, contract;

function init() {
  if (contract) return; // already initialized

  try {
    // Load ABI from copied artifact
    const artifact = require(path.join(__dirname, "../contracts/CharityDonation.json"));
    contractABI = artifact.abi;

    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      signer
    );

    console.log("Blockchain service initialized. Contract:", process.env.CONTRACT_ADDRESS);
  } catch (err) {
    console.warn(
      "Blockchain service could not initialize (contract not deployed yet?):",
      err.message
    );
  }
}

// Try to initialize on module load
init();

/**
 * Register and immediately verify a charity on-chain.
 * Called when admin approves a charity.
 */
async function registerAndVerifyCharity(walletAddress) {
  if (!contract) init();
  if (!contract) throw new Error("Blockchain service not available");

  // Check if already registered on-chain
  let alreadyRegistered = false;
  try {
    const info = await contract.getCharity(walletAddress);
    alreadyRegistered = true;
    // If already registered but not verified, just verify
    if (info.status !== 2n) {
      // 2 = Verified
      const tx = await contract.verifyCharity(walletAddress);
      await tx.wait();
      console.log(`Charity ${walletAddress} verified on-chain. TX: ${tx.hash}`);
    }
  } catch {
    // Not registered yet — register first
    alreadyRegistered = false;
  }

  if (!alreadyRegistered) {
    const tx1 = await contract.registerCharity(walletAddress);
    await tx1.wait();
    console.log(`Charity ${walletAddress} registered on-chain. TX: ${tx1.hash}`);

    const tx2 = await contract.verifyCharity(walletAddress);
    await tx2.wait();
    console.log(`Charity ${walletAddress} verified on-chain. TX: ${tx2.hash}`);
  }
}

/**
 * Reject a charity on-chain.
 */
async function rejectCharity(walletAddress) {
  if (!contract) init();
  if (!contract) throw new Error("Blockchain service not available");

  try {
    await contract.getCharity(walletAddress); // throws if not registered
    const tx = await contract.rejectCharity(walletAddress);
    await tx.wait();
    console.log(`Charity ${walletAddress} rejected on-chain. TX: ${tx.hash}`);
  } catch (err) {
    if (err.message.includes("Charity not registered")) {
      console.warn(`Charity ${walletAddress} not on chain yet — skipping rejection.`);
      return;
    }
    throw err;
  }
}

module.exports = { registerAndVerifyCharity, rejectCharity };
