const mongoose = require("mongoose");

/**
 * DonationRecord Model (Off-chain application record)
 *
 * This model stores an application-layer record of each donation.
 * The AUTHORITATIVE record is on the blockchain (transaction hash).
 *
 * Fields derived from blockchain (reference only):
 *  - transactionHash  → the on-chain tx hash
 *  - blockNumber      → block in which the tx was mined
 *  - donorWallet      → donor's Ethereum address
 *  - charityWallet    → charity's Ethereum address
 *  - amount           → donation amount in ETH (string, not float)
 *  - blockTimestamp   → block timestamp
 *
 * Fields that are application metadata (off-chain):
 *  - charityId        → MongoDB Charity document reference
 *  - donorId          → MongoDB User document reference
 *  - status           → tracks pending/confirmed/failed
 *  - network          → which network the transaction was on
 */
const donationRecordSchema = new mongoose.Schema(
  {
    // ── Blockchain-derived fields (reference) ──────────────────────
    transactionHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      unique: true,
      trim: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    donorWallet: {
      type: String,
      required: [true, "Donor wallet is required"],
      lowercase: true,
      trim: true,
    },
    charityWallet: {
      type: String,
      required: [true, "Charity wallet is required"],
      lowercase: true,
      trim: true,
    },
    // Amount in ETH (stored as string to avoid floating-point issues)
    amount: {
      type: String,
      required: [true, "Amount is required"],
    },
    // Amount in Wei (as string for precision)
    amountWei: {
      type: String,
      default: "0",
    },
    // Block timestamp from blockchain
    blockTimestamp: {
      type: Date,
      default: null,
    },

    // ── Application metadata (off-chain) ───────────────────────────
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    network: {
      type: String,
      default: "localhost",
    },
    // Chain ID for explorer URL generation
    chainId: {
      type: Number,
      default: 31337,
    },
  },
  {
    timestamps: true, // createdAt = when backend received the record
  }
);

// Indexes (unique already set on transactionHash field above)
donationRecordSchema.index({ donorWallet: 1 });
donationRecordSchema.index({ charityWallet: 1 });
donationRecordSchema.index({ charityId: 1 });
donationRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DonationRecord", donationRecordSchema);
