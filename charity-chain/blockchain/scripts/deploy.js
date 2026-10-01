/**
 * deploy.js
 * Deploys the CharityDonation contract and prints the address.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("─────────────────────────────────────────");
  console.log("Deploying CharityDonation contract...");
  console.log("Deployer address :", deployer.address);
  console.log(
    "Deployer balance :",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    "ETH"
  );
  console.log("─────────────────────────────────────────");

  // Deploy — pass deployer address as initialOwner (Ownable)
  const CharityDonation = await hre.ethers.getContractFactory("CharityDonation");
  const contract = await CharityDonation.deploy(deployer.address);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("✅ CharityDonation deployed to:", contractAddress);
  console.log("─────────────────────────────────────────");
  console.log("Next steps:");
  console.log("1. Copy the contract address above.");
  console.log("2. Update CONTRACT_ADDRESS in your backend .env file.");
  console.log("3. Update VITE_CONTRACT_ADDRESS in your frontend .env file.");
  console.log("4. Copy artifacts/contracts/CharityDonation.sol/CharityDonation.json");
  console.log("   to frontend/src/contracts/CharityDonation.json");
  console.log("─────────────────────────────────────────");

  // Also copy ABI automatically
  const fs = require("fs");
  const path = require("path");

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/CharityDonation.sol/CharityDonation.json"
  );
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  const backendContractsDir = path.join(__dirname, "../../backend/contracts");

  [frontendContractsDir, backendContractsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(artifactPath, path.join(dir, "CharityDonation.json"));
    console.log(`ABI copied to: ${dir}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
