/**
 * donation.controller.js
 * Handles recording and retrieving donations.
 *
 * IMPORTANT:
 *  The actual ETH transfer happens on the FRONTEND via MetaMask + Ethers.js.
 *  This backend endpoint receives the confirmed transaction details and
 *  stores an off-chain application record for fast querying.
 */

const Donation = require("../models/Donation.model");
const Charity = require("../models/Charity.model");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");

// ─── POST /api/donations  (record confirmed donation) ────────────────────

exports.recordDonation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    transactionHash,
    donorWallet,
    charityWallet,
    charityId,
    amount,
    blockNumber,
    blockTimestamp,
  } = req.body;

  try {
    // Verify charity exists and is verified
    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }
    if (charity.verificationStatus !== "verified") {
      return res
        .status(400)
        .json({ success: false, message: "Charity is not verified" });
    }

    // Prevent duplicate records for the same tx
    const existing = await Donation.findOne({ transactionHash });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Donation already recorded",
        data: existing,
      });
    }

    // Find donor user (optional — wallet may not be linked to account)
    const donorUser = await User.findOne({
      walletAddress: donorWallet.toLowerCase(),
    });

    const donation = await Donation.create({
      transactionHash: transactionHash.toLowerCase(),
      donorWallet: donorWallet.toLowerCase(),
      charityWallet: charityWallet.toLowerCase(),
      charityId,
      donorId: donorUser ? donorUser._id : null,
      amount: String(amount),
      blockNumber: blockNumber || null,
      blockTimestamp: blockTimestamp || null,
      status: "confirmed",
    });

    // Update charity cached stats
    await Charity.findByIdAndUpdate(charityId, {
      $inc: {
        totalDonations: parseFloat(amount),
        donorCount: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "Donation recorded successfully",
      data: donation,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/donations  (donor's donations) ─────────────────────────────

exports.getMyDonations = async (req, res) => {
  try {
    // Get wallet from query param or from logged-in user
    const wallet =
      req.query.wallet ||
      (req.user && req.user.walletAddress);

    if (!wallet) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address required" });
    }

    const donations = await Donation.find({
      donorWallet: wallet.toLowerCase(),
    })
      .populate("charityId", "name category logoUrl")
      .sort({ createdAt: -1 });

    const totalAmount = donations.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    );

    res.json({
      success: true,
      data: donations,
      summary: {
        totalDonations: donations.length,
        totalAmount: totalAmount.toFixed(6),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/donations/:id  (single donation by ID) ─────────────────────

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate(
      "charityId",
      "name category"
    );
    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation not found" });
    }
    res.json({ success: true, data: donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/donations/public/recent  (public stats page) ───────────────

exports.getRecentDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "confirmed" })
      .populate("charityId", "name category")
      .sort({ createdAt: -1 })
      .limit(20);

    const totalVolume = await Donation.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$amount" } },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        donations,
        totalVolume:
          totalVolume.length > 0 ? totalVolume[0].total.toFixed(6) : "0",
        totalCount:
          totalVolume.length > 0 ? totalVolume[0].count : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
