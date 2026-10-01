const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

// Register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  authController.login
);

// Get current user
router.get("/me", authenticate, authController.getMe);

// Update wallet
router.put("/update-wallet", authenticate, authController.updateWallet);

module.exports = router;
