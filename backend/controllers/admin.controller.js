const Charity = require("../models/Charity.model");
const DonationRecord = require("../models/DonationRecord.model");
const User = require("../models/User.model");

/**
 * GET /api/admin/charities/pending
 * Get all charities with status=pending.
 */
exports.getPendingCharities = async (req, res) => {
  try {
    const charities = await Charity.find({ verificationStatus: "pending" })
      .populate("registeredBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: charities.length, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pending charities" });
  }
};

/**
 * GET /api/admin/charities
 * Get all charities with optional filter.
 */
exports.getAllCharities = async (req, res) => {
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

    const charities = await Charity.find(filter)
      .populate("registeredBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: charities.length, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching charities" });
  }
};

/**
 * PUT /api/admin/charities/:id/approve
 * Admin approves a charity. Sets status to verified.
 *
 * NOTE: The admin should also call the smart contract's verifyCharity()
 * function to record this on-chain. The frontend handles that call.
 * This backend endpoint updates the MongoDB record.
 */
exports.approveCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    charity.verificationStatus = "verified";
    charity.adminNote = req.body.note || "";
    await charity.save();

    res.json({
      success: true,
      message: "Charity approved",
      charity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving charity" });
  }
};

/**
 * PUT /api/admin/charities/:id/reject
 * Admin rejects a charity.
 */
exports.rejectCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    charity.verificationStatus = "rejected";
    charity.adminNote = req.body.reason || "Application rejected";
    await charity.save();

    res.json({
      success: true,
      message: "Charity rejected",
      charity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting charity" });
  }
};

/**
 * GET /api/admin/donations
 * Get all donations with optional filters.
 */
exports.getAllDonations = async (req, res) => {
  try {
    const { charityId, wallet, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (charityId) filter.charityId = charityId;
    if (wallet) filter.donorWallet = wallet.toLowerCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await DonationRecord.find(filter)
      .populate("charityId", "name category")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await DonationRecord.countDocuments(filter);

    res.json({
      success: true,
      count: donations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donations" });
  }
};

/**
 * GET /api/admin/statistics
 * Platform-wide statistics for admin dashboard.
 */
exports.getStatistics = async (req, res) => {
  try {
    const [
      totalCharities,
      pendingCharities,
      verifiedCharities,
      rejectedCharities,
      totalDonations,
      totalDonors,
      totalVolumeAgg,
      donationsByCategory,
      recentDonations,
    ] = await Promise.all([
      Charity.countDocuments(),
      Charity.countDocuments({ verificationStatus: "pending" }),
      Charity.countDocuments({ verificationStatus: "verified" }),
      Charity.countDocuments({ verificationStatus: "rejected" }),
      DonationRecord.countDocuments({ status: "confirmed" }),
      DonationRecord.distinct("donorWallet", { status: "confirmed" }),
      DonationRecord.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
      ]),
      // Donations grouped by charity category
      DonationRecord.aggregate([
        { $match: { status: "confirmed" } },
        {
          $lookup: {
            from: "charities",
            localField: "charityId",
            foreignField: "_id",
            as: "charity",
          },
        },
        { $unwind: "$charity" },
        {
          $group: {
            _id: "$charity.category",
            total: { $sum: { $toDouble: "$amount" } },
            count: { $sum: 1 },
          },
        },
      ]),
      DonationRecord.find({ status: "confirmed" })
        .populate("charityId", "name category")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      stats: {
        totalCharities,
        pendingCharities,
        verifiedCharities,
        rejectedCharities,
        totalDonations,
        totalDonors: totalDonors.length,
        totalVolume: totalVolumeAgg[0]?.total || 0,
        donationsByCategory,
        recentDonations,
      },
    });
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({ success: false, message: "Error fetching statistics" });
  }
};
