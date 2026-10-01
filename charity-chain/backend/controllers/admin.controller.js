/**
 * admin.controller.js
 * Admin-only operations — charity approval, statistics, etc.
 */

const Charity = require("../models/Charity.model");
const Donation = require("../models/Donation.model");
const User = require("../models/User.model");
const blockchainService = require("../services/blockchain.service");

// ─── GET /api/admin/charities/pending ────────────────────────────────────

exports.getPendingCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ verificationStatus: "pending" })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/charities ─────────────────────────────────────────────

exports.getAllCharitiesAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const charities = await Charity.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/charities/:id/approve ────────────────────────────────

exports.approveCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    // 1. Update status in MongoDB
    charity.verificationStatus = "verified";
    charity.verificationNote = req.body.note || null;
    await charity.save();

    // 2. Call smart contract to register + verify on-chain
    try {
      await blockchainService.registerAndVerifyCharity(charity.walletAddress);
    } catch (blockchainErr) {
      // Log the error but don't fail the response — on-chain sync can be retried
      console.error(
        "Blockchain sync warning (charity approved in DB):",
        blockchainErr.message
      );
    }

    res.json({
      success: true,
      message: "Charity approved and verification recorded on-chain.",
      data: charity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/admin/charities/:id/reject ─────────────────────────────────

exports.rejectCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    charity.verificationStatus = "rejected";
    charity.rejectionReason = req.body.reason || "Did not meet requirements";
    await charity.save();

    // Optionally sync rejection to blockchain
    try {
      await blockchainService.rejectCharity(charity.walletAddress);
    } catch (blockchainErr) {
      console.error("Blockchain sync warning (reject):", blockchainErr.message);
    }

    res.json({
      success: true,
      message: "Charity rejected.",
      data: charity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/donations ─────────────────────────────────────────────

exports.getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { transactionHash: { $regex: search, $options: "i" } },
        { donorWallet: { $regex: search, $options: "i" } },
        { charityWallet: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate("charityId", "name category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Donation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/statistics ────────────────────────────────────────────

exports.getStatistics = async (req, res) => {
  try {
    const [
      totalCharities,
      pendingCharities,
      verifiedCharities,
      rejectedCharities,
      totalDonations,
      donorCount,
    ] = await Promise.all([
      Charity.countDocuments(),
      Charity.countDocuments({ verificationStatus: "pending" }),
      Charity.countDocuments({ verificationStatus: "verified" }),
      Charity.countDocuments({ verificationStatus: "rejected" }),
      Donation.countDocuments(),
      User.countDocuments({ role: "donor" }),
    ]);

    // Sum total donation volume
    const volumeResult = await Donation.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]);

    const totalVolume =
      volumeResult.length > 0 ? volumeResult[0].totalVolume : 0;

    // Recent 5 donations
    const recentDonations = await Donation.find()
      .populate("charityId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalCharities,
        pendingCharities,
        verifiedCharities,
        rejectedCharities,
        totalDonations,
        donorCount,
        totalVolume: totalVolume.toFixed(6),
        recentDonations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
