/**
 * Seed script — populates MongoDB with demo data for development.
 * Run: node utils/seed.js
 *
 * Creates:
 *   - 1 Admin user
 *   - 4 Verified demo charities
 *   - 1 Pending charity
 */
require("dotenv").config({ path: "../.env" });
// If running from backend folder, use local .env
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User.model");
const Charity = require("../models/Charity.model");

const DEMO_CHARITIES = [
  {
    name: "Green Earth Initiative",
    description:
      "Green Earth Initiative (DEMO) is a fictional organization dedicated to environmental conservation, tree planting, and sustainable development. This is sample data for demonstration purposes only.",
    email: "info@greenearth.demo",
    phone: "+91-9800000001",
    address: { city: "Mumbai", state: "Maharashtra", country: "India" },
    category: "Environment",
    website: "https://greenearth.demo",
    walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Hardhat account #0
    verificationStatus: "verified",
    totalDonations: 5.25,
    totalDonors: 12,
    isDemo: true,
  },
  {
    name: "Education For All Foundation",
    description:
      "Education For All Foundation (DEMO) provides free education resources, scholarships, and digital learning tools to underprivileged children. This is fictional demo data.",
    email: "contact@educationforall.demo",
    phone: "+91-9800000002",
    address: { city: "Delhi", state: "Delhi", country: "India" },
    category: "Education",
    website: "https://educationforall.demo",
    walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Hardhat account #1
    verificationStatus: "verified",
    totalDonations: 8.1,
    totalDonors: 20,
    isDemo: true,
  },
  {
    name: "Food Relief Network",
    description:
      "Food Relief Network (DEMO) is a fictional charity working to eliminate hunger by distributing meals and supporting food banks. Demo data only.",
    email: "help@foodrelief.demo",
    phone: "+91-9800000003",
    address: { city: "Bangalore", state: "Karnataka", country: "India" },
    category: "Food & Nutrition",
    website: "https://foodrelief.demo",
    walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", // Hardhat account #2
    verificationStatus: "verified",
    totalDonations: 3.75,
    totalDonors: 9,
    isDemo: true,
  },
  {
    name: "Community Health Support",
    description:
      "Community Health Support (DEMO) provides access to basic healthcare services, medicine, and health awareness programs for rural communities. Fictional demo organization.",
    email: "care@communityhealth.demo",
    phone: "+91-9800000004",
    address: { city: "Chennai", state: "Tamil Nadu", country: "India" },
    category: "Health",
    website: "https://communityhealth.demo",
    walletAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906", // Hardhat account #3
    verificationStatus: "verified",
    totalDonations: 2.5,
    totalDonors: 7,
    isDemo: true,
  },
  {
    name: "Children's Future Trust",
    description:
      "Children's Future Trust (DEMO) supports child welfare, nutrition, and education programs. Pending verification — demo data only.",
    email: "info@childrensfuture.demo",
    phone: "+91-9800000005",
    address: { city: "Hyderabad", state: "Telangana", country: "India" },
    category: "Children & Youth",
    website: "https://childrensfuture.demo",
    walletAddress: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", // Hardhat account #4
    verificationStatus: "pending",
    totalDonations: 0,
    totalDonors: 0,
    isDemo: true,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/charitychain";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing demo data
    await User.deleteMany({ email: { $regex: /\.demo$|charitychain\.com/ } });
    await Charity.deleteMany({ isDemo: true });
    console.log("🗑️  Cleared old demo data");

    // Create admin user
    const admin = await User.create({
      name: "CharityChain Admin",
      email: process.env.ADMIN_EMAIL || "admin@charitychain.com",
      passwordHash: process.env.ADMIN_PASSWORD || "Admin@1234",
      role: "admin",
    });
    console.log("👤 Admin created:", admin.email);

    // Create demo charity users and charities
    for (const charityData of DEMO_CHARITIES) {
      // Create charity user account
      const charityUser = await User.create({
        name: charityData.name,
        email: charityData.email,
        passwordHash: "Charity@1234",
        role: "charity",
        walletAddress: charityData.walletAddress,
      });

      // Create charity
      const charity = await Charity.create({
        ...charityData,
        registeredBy: charityUser._id,
      });

      // Link charity to user
      charityUser.charityId = charity._id;
      await charityUser.save();

      console.log(`✅ Charity created: ${charity.name} (${charity.verificationStatus})`);
    }

    // Create a demo donor
    await User.create({
      name: "Demo Donor",
      email: "donor@charitychain.demo",
      passwordHash: "Donor@1234",
      role: "donor",
      walletAddress: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    });
    console.log("👤 Demo donor created: donor@charitychain.demo / Donor@1234");

    console.log("\n─────────────────────────────────────────");
    console.log("✅ SEED COMPLETE");
    console.log("─────────────────────────────────────────");
    console.log("Admin login:  admin@charitychain.com / Admin@1234");
    console.log("Donor login:  donor@charitychain.demo / Donor@1234");
    console.log("─────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
