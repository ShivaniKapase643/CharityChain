const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const charityController = require("../controllers/charity.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// GET /api/charities  (public)
router.get("/", charityController.getAllCharities);

// GET /api/charities/my  (charity role)
router.get("/my", protect, authorizeRoles("charity"), charityController.getMyCharity);

// GET /api/charities/:id/donations  (public)
router.get("/:id/donations", charityController.getCharityDonations);

// GET /api/charities/:id  (public)
router.get("/:id", charityController.getCharityById);

// POST /api/charities  (charity role — register)
router.post(
  "/",
  protect,
  authorizeRoles("charity"),
  [
    body("name").trim().notEmpty().withMessage("Organization name required"),
    body("description").trim().notEmpty().withMessage("Description required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("category").notEmpty().withMessage("Category required"),
    body("walletAddress")
      .trim()
      .notEmpty()
      .withMessage("Wallet address required")
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage("Invalid Ethereum wallet address"),
  ],
  charityController.createCharity
);

// PUT /api/charities/:id  (charity owner)
router.put(
  "/:id",
  protect,
  authorizeRoles("charity"),
  charityController.updateCharity
);

module.exports = router;
