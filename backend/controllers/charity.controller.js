const Charity = require("../models/Charity.model");
const User = require("../models/User.model");
const DonationRecord = require("../models/DonationRecord.model");

/**
 * GET /api/charities
 * Public — returns all verified charities (with optional filters).
 */
exports.getAllCharities = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};

    // Public endpoint only shows verified charities by default
    filter.verificationStatus = status || "verified";

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const charities = await Charity.find(filter)
      .select("-adminNote -verificationMetadata -registeredBy")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: charities.length, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching charities", error: error.message });
  }
};

/**
 * GET /api/charities/:id
 * Public — returns details of a single charity.
 */
exports.getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id)
      .select("-adminNote -registeredBy");

    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    // Get recent donations for this charity
    const recentDonations = await DonationRecord.find({ charityId: charity._id, status: "confirmed" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("donorWallet amount transactionHash blockTimestamp");

    res.json({ success: true, charity, recentDonations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching charity", error: error.message });
  }
};

/**
 * POST /api/charities
 * Creates a new charity application. Authenticated, role=charity.
 * Also creates/updates the associated user account.
 */
exports.createCharity = async (req, res) => {
  try {
    const {
      name, description, email, phone, address,
      category, website, walletAddress, documentType, documentName,
    } = req.body;

    // Check wallet not already registered
    const existingWallet = await Charity.findOne({ walletAddress: walletAddress?.toLowerCase() });
    if (existingWallet) {
      return res.status(400).json({ success: false, message: "Wallet address already registered" });
    }

    // Check charity email not already registered
    const existingEmail = await Charity.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Charity email already registered" });
    }

    const charity = await Charity.create({
      name,
      description,
      email,
      phone,
      address,
      category,
      website,
      walletAddress: walletAddress?.toLowerCase(),
      verificationStatus: "pending",
      verificationMetadata: {
        documentType: documentType || "Registration Certificate",
        documentName: documentName || "document",
        submittedAt: new Date(),
      },
      registeredBy: req.user._id,
    });

    // Link charity to the user account
    await User.findByIdAndUpdate(req.user._id, {
      charityId: charity._id,
      walletAddress: walletAddress?.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "Charity application submitted. Pending admin approval.",
      charity,
    });
  } catch (error) {
    console.error("Create charity error:", error);
    res.status(500).json({ success: false, message: "Error creating charity", error: error.message });
  }
};

/**
 * PUT /api/charities/:id
 * Charity updates their own profile. Authenticated, role=charity.
 */
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    // Only the charity owner can update
    if (charity.registeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this charity" });
    }

    const allowedUpdates = ["description", "phone", "address", "website", "logoUrl"];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Charity.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Charity updated", charity: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating charity", error: error.message });
  }
};

/**
 * GET /api/charities/status/:status
 * Get charities by status. Admin only in practice (called via admin routes).
 */
exports.getCharitiesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const charities = await Charity.find({ verificationStatus: status })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: charities.length, charities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching charities" });
  }
};

/**
 * GET /api/charities/my/dashboard
 * Charity owner gets their own dashboard data.
 */
exports.getMyCharityDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.charityId) {
      return res.status(404).json({ success: false, message: "No charity associated with this account" });
    }

    const charity = await Charity.findById(user.charityId);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }

    const donations = await DonationRecord.find({
      charityId: charity._id,
      status: "confirmed",
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const totalDonationCount = await DonationRecord.countDocuments({
      charityId: charity._id,
      status: "confirmed",
    });

    // Compute total amount
    const totalAgg = await DonationRecord.aggregate([
      { $match: { charityId: charity._id, status: "confirmed" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]);
    const totalAmount = totalAgg[0]?.total || 0;

    res.json({
      success: true,
      charity,
      stats: {
        totalDonations: totalDonationCount,
        totalAmount,
      },
      donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard", error: error.message });
  }
};
