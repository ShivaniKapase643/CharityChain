/**
 * charity.controller.js
 */

const Charity = require("../models/Charity.model");
const User = require("../models/User.model");
const Donation = require("../models/Donation.model");
const { validationResult } = require("express-validator");

// ─── GET /api/charities  (public) ─────────────────────────────────────────

exports.getAllCharities = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12 } = req.query;

    const filter = {};

    // Only return verified charities by default for public browse
    filter.verificationStatus =
      status && ["pending", "verified", "rejected"].includes(status)
        ? status
        : "verified";

    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [charities, total] = await Promise.all([
      Charity.find(filter)
        .select(
          "name shortDescription category verificationStatus walletAddress totalDonations donorCount logoUrl createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Charity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: charities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/charities/:id  (public) ─────────────────────────────────────

exports.getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res
        .status(404)
        .json({ success: false, message: "Charity not found" });
    }
    res.json({ success: true, data: charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/charities  (charity role — register profile) ───────────────

exports.createCharity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // A user can only have one charity
    const exists = await Charity.findOne({ userId: req.user._id });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "You have already registered a charity",
      });
    }

    const {
      name,
      description,
      shortDescription,
      email,
      phone,
      address,
      category,
      website,
      walletAddress,
      registrationNumber,
      documentDescription,
    } = req.body;

    // Check wallet not already used
    const walletTaken = await Charity.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });
    if (walletTaken) {
      return res.status(409).json({
        success: false,
        message: "This wallet address is already registered",
      });
    }

    const charity = await Charity.create({
      name,
      description,
      shortDescription,
      email,
      phone,
      address,
      category,
      website,
      walletAddress: walletAddress.toLowerCase(),
      userId: req.user._id,
      verificationMetadata: {
        registrationNumber,
        documentDescription,
        submittedAt: new Date(),
      },
    });

    // Link charity to user
    await User.findByIdAndUpdate(req.user._id, { charityId: charity._id });

    res.status(201).json({
      success: true,
      message: "Charity application submitted. Awaiting admin review.",
      data: charity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/charities/:id  (owner only) ─────────────────────────────────

exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res
        .status(404)
        .json({ success: false, message: "Charity not found" });
    }

    // Only the owning user can update
    if (charity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowedFields = [
      "name",
      "description",
      "shortDescription",
      "email",
      "phone",
      "address",
      "website",
      "logoUrl",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) charity[field] = req.body[field];
    });

    await charity.save();
    res.json({ success: true, data: charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/charities/my  (charity role — own profile) ──────────────────

exports.getMyCharity = async (req, res) => {
  try {
    const charity = await Charity.findOne({ userId: req.user._id });
    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "No charity profile found for this account",
      });
    }
    res.json({ success: true, data: charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/charities/:id/donations  (public) ───────────────────────────

exports.getCharityDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ charityId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
