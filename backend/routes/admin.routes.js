const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeRoles("admin"));

router.get("/charities/pending", adminController.getPendingCharities);
router.get("/charities", adminController.getAllCharities);
router.put("/charities/:id/approve", adminController.approveCharity);
router.put("/charities/:id/reject", adminController.rejectCharity);
router.get("/donations", adminController.getAllDonations);
router.get("/statistics", adminController.getStatistics);

module.exports = router;
