const DonationRecord = require("../models/DonationRecord.model");
const Charity = require("../models/Charity.model");

/**
 * POST /api/donations
 * Called by the frontend AFTER a successful blockchain transaction.
 * Records the donation in MongoDB for fast lookups.
 *
 * The blockchain transaction is the authoritative record.
 * This is an application-layer mirror for the UI.
 */
exports.createDonation = async (req, res) => {
  try {
    const {
      transactionHash,
      charityId,
      charityWallet,
      amount,       // In ETH
      amountWei,
      blockNumber,
      blockTimestamp,
      chainId,
      network,
    } = req.body;

    // Validate charity exists and is verified
    const charity = await Charity.findById(charityId);
    if (!charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }
    if (charity.verificationStatus !== "verified") {
      return res.status(400).json({ success: false, message: "Charity is not verified" });
    }

    // Check if tx hash already recorded (prevent duplicates)
    const existing = await DonationRecord.findOne({ transactionHash });
    if (existing) {
      return res.status(200).json({ success: true, message: "Already recorded", donation: existing });
    }

    // Require wallet connection — donorWallet comes from the authenticated
    // user's wallet address or from the request body (MetaMask address)
    const donorWallet =
      req.body.donorWallet ||
      req.user?.walletAddress ||
      null;

    const donation = await DonationRecord.create({
      transactionHash,
      charityId,
      charityWallet: charityWallet?.toLowerCase(),
      donorWallet: donorWallet?.toLowerCase(),
      donorId: req.user?._id || null,
      amount: amount.toString(),
      amountWei: amountWei?.toString() || "0",
      blockNumber: blockNumber || null,
      blockTimestamp: blockTimestamp ? new Date(blockTimestamp * 1000) : new Date(),
      status: "confirmed",
      network: network || "localhost",
      chainId: chainId || 31337,
    });

    // Update charity cached stats
    await Charity.findByIdAndUpdate(charityId, {
      $inc: {
        totalDonations: parseFloat(amount),
        totalDonors: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "Donation recorded",
      donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ success: false, message: "Error recording donation", error: error.message });
  }
};

/**
 * GET /api/donations
 * Get donations for the authenticated user (donor).
 */
exports.getMyDonations = async (req, res) => {
  try {
    const walletAddress =
      req.query.wallet || req.user?.walletAddress;

    if (!walletAddress) {
      return res.status(400).json({ success: false, message: "Wallet address required" });
    }

    const donations = await DonationRecord.find({
      donorWallet: walletAddress.toLowerCase(),
      status: "confirmed",
    })
      .populate("charityId", "name category logoUrl verificationStatus")
      .sort({ createdAt: -1 });

    const totalAmount = donations.reduce(
      (sum, d) => sum + parseFloat(d.amount || 0),
      0
    );

    res.json({
      success: true,
      count: donations.length,
      totalAmount,
      donations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donations", error: error.message });
  }
};

/**
 * GET /api/donations/:id
 * Get a single donation by MongoDB ID.
 */
exports.getDonationById = async (req, res) => {
  try {
    const donation = await DonationRecord.findById(req.params.id)
      .populate("charityId", "name category walletAddress logoUrl");

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donation" });
  }
};

/**
 * GET /api/donations/tx/:hash
 * Lookup by transaction hash.
 */
exports.getDonationByTxHash = async (req, res) => {
  try {
    const donation = await DonationRecord.findOne({
      transactionHash: req.params.hash,
    }).populate("charityId", "name category walletAddress logoUrl");

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donation" });
  }
};
