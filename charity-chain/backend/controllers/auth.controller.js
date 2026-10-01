/**
 * auth.controller.js
 * Handles registration and login for all roles.
 */

const User = require("../models/User.model");
const Charity = require("../models/Charity.model");
const { generateToken } = require("../utils/jwt");
const { validationResult } = require("express-validator");

// ─── Register ─────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, walletAddress } = req.body;

  try {
    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    // Only allow donor and charity self-registration
    if (!["donor", "charity"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role for self-registration" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook hashes this
      role,
      walletAddress: walletAddress ? walletAddress.toLowerCase() : null,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user);

    // Fetch charity data if role is charity
    let charityData = null;
    if (user.role === "charity" && user.charityId) {
      charityData = await Charity.findById(user.charityId).select(
        "name verificationStatus _id"
      );
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        charityId: user.charityId,
        charity: charityData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get current user (me) ────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    let charityData = null;
    if (user.role === "charity" && user.charityId) {
      charityData = await Charity.findById(user.charityId).select(
        "name verificationStatus _id walletAddress"
      );
    }
    res.json({ success: true, user, charity: charityData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
