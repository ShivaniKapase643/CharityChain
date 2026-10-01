const express = require("express");
const router = express.Router();
const charityController = require("../controllers/charity.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// Public routes
router.get("/", charityController.getAllCharities);
router.get("/status/:status", charityController.getCharitiesByStatus);

// Charity dashboard (authenticated charity user)
router.get(
  "/my/dashboard",
  authenticate,
  authorizeRoles("charity"),
  charityController.getMyCharityDashboard
);

// Get charity by ID (public)
router.get("/:id", charityController.getCharityById);

// Create charity application (authenticated, charity role)
router.post(
  "/",
  authenticate,
  authorizeRoles("charity"),
  charityController.createCharity
);

// Update charity (authenticated, charity role)
router.put(
  "/:id",
  authenticate,
  authorizeRoles("charity"),
  charityController.updateCharity
);

module.exports = router;
