/**
 * server.js — CharityChain Express server entry point
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth.routes");
const charityRoutes = require("./routes/charity.routes");
const adminRoutes = require("./routes/admin.routes");
const donationRoutes = require("./routes/donation.routes");

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" })); // Restrict in production
app.use(express.json());
app.use(morgan("dev"));

// ─── Database ─────────────────────────────────────────────────────────────
connectDB();

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Central Error Handler ────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CharityChain API running on http://localhost:${PORT}`);
});
