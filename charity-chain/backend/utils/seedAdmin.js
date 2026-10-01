/**
 * seedAdmin.js
 * Run once to create the admin user and seed sample charities.
 * Usage: node utils/seedAdmin.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Charity = require("../models/Charity.model");

const ADMIN_EMAIL = "admin@charitychain.demo";
const ADMIN_PASSWORD = "Admin@1234";

const SAMPLE_CHARITIES = [
  {
    name: "Green Earth Initiative",
    description:
      "Green Earth Initiative is a fictional demo organization dedicated to reforestation and environmental conservation. We plant trees and support sustainable farming practices in rural communities.",
    shortDescription:
      "Demo charity focused on reforestation and environmental conservation.",
    email: "contact@greenearth.demo",
    phone: "+1-555-0101",
    address: "123 Forest Lane, Demo City, DC 10001",
    category: "Environment",
    website: "https://greenearth.demo",
    walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    verificationStatus: "verified",
    totalDonations: 2.5,
    donorCount: 12,
    verificationMetadata: {
      registrationNumber: "NGO-2024-001",
      documentDescription: "Environmental NGO registration certificate (demo)",
      submittedAt: new Date(),
    },
  },
  {
    name: "Education For All Foundation",
    description:
      "Education For All Foundation is a demo charitable organization working to provide free digital education resources to underprivileged children in rural areas. [DEMO DATA]",
    shortDescription:
      "Demo charity providing free digital education resources to underprivileged children.",
    email: "info@educationforall.demo",
    phone: "+1-555-0202",
    address: "456 Scholar Street, Demo City, DC 10002",
    category: "Education",
    website: "https://educationforall.demo",
    walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    verificationStatus: "verified",
    totalDonations: 1.8,
    donorCount: 8,
    verificationMetadata: {
      registrationNumber: "NGO-2024-002",
      documentDescription: "Education charity registration certificate (demo)",
      submittedAt: new Date(),
    },
  },
  {
    name: "Food Relief Network",
    description:
      "Food Relief Network is a fictional demo organization providing nutritious meals to disaster-affected communities. Our network of volunteers ensures food reaches those who need it most. [DEMO DATA]",
    shortDescription:
      "Demo charity delivering nutritious meals to disaster-affected communities.",
    email: "help@foodrelief.demo",
    phone: "+1-555-0303",
    address: "789 Nourish Road, Demo City, DC 10003",
    category: "Food Relief",
    website: "https://foodrelief.demo",
    walletAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    verificationStatus: "verified",
    totalDonations: 3.2,
    donorCount: 18,
    verificationMetadata: {
      registrationNumber: "NGO-2024-003",
      documentDescription: "Food relief organization certificate (demo)",
      submittedAt: new Date(),
    },
  },
  {
    name: "Community Health Support",
    description:
      "Community Health Support is a demo charitable organization providing free medical camps and health awareness programs in underserved communities. [DEMO DATA]",
    shortDescription:
      "Demo charity running free medical camps and health awareness programs.",
    email: "care@communityhealth.demo",
    phone: "+1-555-0404",
    address: "321 Wellness Ave, Demo City, DC 10004",
    category: "Health",
    website: "https://communityhealth.demo",
    walletAddress: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    verificationStatus: "verified",
    totalDonations: 1.1,
    donorCount: 6,
    verificationMetadata: {
      registrationNumber: "NGO-2024-004",
      documentDescription: "Health NGO registration certificate (demo)",
      submittedAt: new Date(),
    },
  },
  {
    name: "Paws & Care Animal Welfare",
    description:
      "Paws & Care is a demo organization rescuing and rehoming stray animals. We run adoption drives and free veterinary camps for street animals. [DEMO DATA]",
    shortDescription:
      "Demo charity rescuing and rehoming stray animals.",
    email: "adopt@pawscare.demo",
    phone: "+1-555-0505",
    address: "654 Paws Boulevard, Demo City, DC 10005",
    category: "Animal Welfare",
    website: "https://pawscare.demo",
    walletAddress: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    verificationStatus: "pending",
    verificationMetadata: {
      registrationNumber: "NGO-2024-005",
      documentDescription: "Animal welfare organization certificate (demo)",
      submittedAt: new Date(),
    },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // ── Admin user ──────────────────────────────────────────────────────────
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: "CharityChain Admin",
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  // ── Demo charity users + charity profiles ───────────────────────────────
  for (const charityData of SAMPLE_CHARITIES) {
    const existing = await Charity.findOne({ email: charityData.email });
    if (existing) {
      console.log(`Charity "${charityData.name}" already exists, skipping.`);
      continue;
    }

    // Create a user account for this charity
    const charityUser = await User.create({
      name: charityData.name,
      email: charityData.email,
      passwordHash: "Charity@1234",
      role: "charity",
      walletAddress: charityData.walletAddress,
    });

    const charity = await Charity.create({
      ...charityData,
      userId: charityUser._id,
    });

    // Link charity to user
    await User.findByIdAndUpdate(charityUser._id, { charityId: charity._id });

    console.log(`Created charity: ${charityData.name}`);
  }

  console.log("\n✅ Seed complete.");
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("All charity users have password: Charity@1234");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
