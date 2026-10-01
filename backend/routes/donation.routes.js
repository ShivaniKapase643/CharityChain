const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donation.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Create donation record (called after successful blockchain tx)
// authenticate is optional — allow unregistered wallets to donate
router.post("/", donationController.createDonation);

// Get my donations (requires authentication or wallet query param)
router.get("/", authenticate, donationController.getMyDonations);

// Get donation by tx hash (public for verification)
router.get("/tx/:hash", donationController.getDonationByTxHash);

// Get donation by MongoDB ID
router.get("/:id", donationController.getDonationById);

module.exports = router;
