const mongoose = require("mongoose");

/**
 * Charity Model (Off-chain application data)
 *
 * ON-CHAIN (blockchain): walletAddress, verificationStatus (mirrored),
 *                         donation totals, events
 * OFF-CHAIN (MongoDB):   name, description, email, phone, address,
 *                         category, website, documents metadata,
 *                         admin notes, createdAt, updatedAt
 *
 * verificationStatus is stored here for fast queries but the
 * authoritative verification is recorded on the smart contract.
 */
const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [200, "Name too long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Education",
        "Health",
        "Environment",
        "Food & Nutrition",
        "Disaster Relief",
        "Animal Welfare",
        "Community Development",
        "Children & Youth",
        "Women Empowerment",
        "Other",
      ],
    },
    website: {
      type: String,
      trim: true,
    },
    // Ethereum wallet address — used in smart contract
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      lowercase: true,
      trim: true,
    },
    // Verification status mirrors the smart contract state
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    // Metadata about submitted verification documents (NOT the documents themselves)
    // Large files would be stored in cloud storage — only metadata here
    verificationMetadata: {
      documentType: String,    // e.g., "NGO Registration Certificate"
      documentName: String,    // Filename reference
      submittedAt: Date,
    },
    // Admin notes (off-chain only)
    adminNote: {
      type: String,
      default: "",
    },
    // Avatar/logo URL (stored externally, only URL here)
    logoUrl: {
      type: String,
      default: "",
    },
    // Stats cached from blockchain (for quick display, not authoritative)
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalDonors: {
      type: Number,
      default: 0,
    },
    // Reference to the user account that registered this charity
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
charitySchema.index({ verificationStatus: 1 });
charitySchema.index({ category: 1 });
charitySchema.index({ walletAddress: 1 });

module.exports = mongoose.model("Charity", charitySchema);
