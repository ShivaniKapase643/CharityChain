const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  const networkInfo = await hre.ethers.provider.getNetwork();
  const chainId = Number(networkInfo.chainId);

  console.log("🚀 Deploying CharityDonation contract...\n");
  console.log(`Network  : ${networkName}`);
  console.log(`Chain ID : ${chainId}`);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer :", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance  :", hre.ethers.formatEther(balance), "ETH\n");

  if (chainId === 11155111) {
    console.log("⚠️  Deploying to SEPOLIA TESTNET — uses real test ETH from faucet.");
    console.log("⚠️  This is for demonstration/academic purposes only. NOT real funds.\n");
  }

  // Deploy the contract
  const CharityDonation = await hre.ethers.getContractFactory("CharityDonation");
  const contract = await CharityDonation.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ CharityDonation deployed to:", contractAddress);

  // ─────────────────────────────────────────────
  // Save deployment info to blockchain/deployments/<network>.json
  // ─────────────────────────────────────────────
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentInfo = {
    contractAddress,
    network: networkName,
    chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Save network-specific file (localhost.json or sepolia.json)
  const networkFile = path.join(deploymentDir, `${networkName}.json`);
  fs.writeFileSync(networkFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to blockchain/deployments/${networkName}.json`);

  // ─────────────────────────────────────────────
  // Copy ABI + address to frontend and backend
  // Only overwrite if the artifact exists (i.e. contract was compiled)
  // ─────────────────────────────────────────────
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/CharityDonation.sol/CharityDonation.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiWithAddress = { abi: artifact.abi, address: contractAddress, chainId, network: networkName };

    // Frontend contracts folder
    const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
    if (!fs.existsSync(frontendContractsDir)) {
      fs.mkdirSync(frontendContractsDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(frontendContractsDir, "CharityDonation.json"),
      JSON.stringify(abiWithAddress, null, 2)
    );
    console.log("📄 ABI + address copied to frontend/src/contracts/CharityDonation.json");

    // Backend contracts config folder
    const backendContractsDir = path.join(__dirname, "../../backend/config/contracts");
    if (!fs.existsSync(backendContractsDir)) {
      fs.mkdirSync(backendContractsDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(backendContractsDir, "CharityDonation.json"),
      JSON.stringify(abiWithAddress, null, 2)
    );
    console.log("📄 ABI + address copied to backend/config/contracts/CharityDonation.json");
  }

  // ─────────────────────────────────────────────
  // Print env var instructions
  // ─────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────");
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("─────────────────────────────────────────────────────");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Network          : ${networkName} (chainId: ${chainId})`);
  console.log("\n👉 Update your environment files with:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  if (chainId === 11155111) {
    console.log(`   VITE_NETWORK_CHAIN_ID=11155111`);
    console.log(`   VITE_NETWORK_NAME=Sepolia`);
    console.log("\n🔗 Verify on Etherscan (after a few minutes):");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  } else {
    console.log(`   VITE_NETWORK_CHAIN_ID=31337`);
    console.log(`   VITE_NETWORK_NAME=Hardhat Local`);
  }
  console.log("─────────────────────────────────────────────────────\n");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
