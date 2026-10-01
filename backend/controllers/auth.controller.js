const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Charity = require("../models/Charity.model");

/**
 * Generate JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * POST /api/auth/register
 * Registers a new donor or charity user.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, walletAddress } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Only allow donor and charity roles via registration
    const allowedRoles = ["donor", "charity"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Pre-save hook will hash this
      role: role || "donor",
      walletAddress: walletAddress || null,
    });

    const token = signToken(user._id);

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
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with password (normally excluded)
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account is deactivated" });
    }

    const token = signToken(user._id);

    // If charity user, get charity details
    let charityData = null;
    if (user.role === "charity" && user.charityId) {
      charityData = await Charity.findById(user.charityId).select(
        "name verificationStatus walletAddress category"
      );
    }

    res.json({
      success: true,
      message: "Login successful",
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let charityData = null;
    if (user.role === "charity" && user.charityId) {
      charityData = await Charity.findById(user.charityId);
    }
    res.json({ success: true, user, charity: charityData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

/**
 * PUT /api/auth/update-wallet
 * Update connected wallet address for a donor.
 */
exports.updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress: walletAddress?.toLowerCase() },
      { new: true }
    );
    res.json({ success: true, message: "Wallet address updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating wallet" });
  }
};
