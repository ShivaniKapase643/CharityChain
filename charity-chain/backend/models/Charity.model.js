/**
 * Charity Model (off-chain)
 * Stores charity profile data in MongoDB.
 * The walletAddress links this document to the on-chain record.
 *
 * Fields explanation:
 *  - walletAddress   → also stored on-chain for donation routing
 *  - verificationStatus → mirrored from on-chain after admin action
 *  - category, description, etc. → purely off-chain metadata
 */

const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
  {
    // ── Profile ─────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      maxlength: 300,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Education",
        "Health",
        "Environment",
        "Food Relief",
        "Disaster Relief",
        "Animal Welfare",
        "Community Development",
        "Other",
      ],
      required: true,
    },
    logoUrl: {
      type: String,
      default: null,
    },

    // ── Blockchain ──────────────────────────────────────────
    // ETH wallet address — this is what appears on-chain
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Verification ────────────────────────────────────────
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    verificationNote: {
      type: String,
      default: null,
    },
    // Metadata about submitted documents (NOT the documents themselves)
    verificationMetadata: {
      registrationNumber: String,
      documentDescription: String, // e.g., "NGO registration certificate"
      submittedAt: Date,
    },

    // ── Stats (derived / cached from blockchain or donations collection) ──
    // These are kept as a cache for fast UI — the blockchain is the source of truth
    totalDonations: {
      type: Number,
      default: 0,
    },
    donorCount: {
      type: Number,
      default: 0,
    },

    // Reference to the user account that manages this charity
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Charity", charitySchema);
