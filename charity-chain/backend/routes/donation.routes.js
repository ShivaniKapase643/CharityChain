const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const donationController = require("../controllers/donation.controller");
const { protect } = require("../middleware/auth.middleware");

// GET /api/donations/public/recent  (public — transparency page)
router.get("/public/recent", donationController.getRecentDonations);

// POST /api/donations  (record confirmed donation — donor must be logged in)
router.post(
  "/",
  protect,
  [
    body("transactionHash")
      .trim()
      .notEmpty()
      .withMessage("Transaction hash required"),
    body("donorWallet").trim().notEmpty().withMessage("Donor wallet required"),
    body("charityWallet")
      .trim()
      .notEmpty()
      .withMessage("Charity wallet required"),
    body("charityId").notEmpty().withMessage("Charity ID required"),
    body("amount").notEmpty().withMessage("Amount required"),
  ],
  donationController.recordDonation
);

// GET /api/donations  (donor's own donations — by wallet query param)
router.get("/", protect, donationController.getMyDonations);

// GET /api/donations/:id
router.get("/:id", protect, donationController.getDonationById);

module.exports = router;
