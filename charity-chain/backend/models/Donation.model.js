/**
 * DonationRecord Model (off-chain application record)
 *
 * Field provenance:
 *  transactionHash → from blockchain (on-chain) — primary identifier
 *  blockNumber     → from blockchain (on-chain)
 *  donorWallet     → from blockchain (on-chain)
 *  charityWallet   → from blockchain (on-chain)
 *  amount          → from blockchain (on-chain, in ETH string)
 *  timestamp       → from blockchain (on-chain)
 *
 *  charityId       → MongoDB ref — links to off-chain Charity document
 *  donorId         → MongoDB ref — links to off-chain User document (optional)
 *  status          → application-level status
 *
 * NOTE: The blockchain is the authoritative record.
 *       This MongoDB document is a convenience index for fast queries.
 */

const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    // ── Blockchain-derived fields ────────────────────────────
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    donorWallet: {
      type: String,
      required: true,
      lowercase: true,
    },
    charityWallet: {
      type: String,
      required: true,
      lowercase: true,
    },
    // Amount stored as string to avoid floating-point issues (e.g., "0.05")
    amount: {
      type: String,
      required: true,
    },
    // Unix timestamp from block
    blockTimestamp: {
      type: Number,
      default: null,
    },

    // ── Application metadata ─────────────────────────────────
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
    // confirmed = tx confirmed on blockchain, pending = waiting confirmation
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
