const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

// All admin routes require admin role
router.use(protect, authorizeRoles("admin"));

// GET /api/admin/charities/pending
router.get("/charities/pending", adminController.getPendingCharities);

// GET /api/admin/charities
router.get("/charities", adminController.getAllCharitiesAdmin);

// PUT /api/admin/charities/:id/approve
router.put("/charities/:id/approve", adminController.approveCharity);

// PUT /api/admin/charities/:id/reject
router.put("/charities/:id/reject", adminController.rejectCharity);

// GET /api/admin/donations
router.get("/donations", adminController.getAllDonations);

// GET /api/admin/statistics
router.get("/statistics", adminController.getStatistics);

module.exports = router;
