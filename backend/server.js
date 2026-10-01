require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");

// Route imports
const authRoutes = require("./routes/auth.routes");
const charityRoutes = require("./routes/charity.routes");
const donationRoutes = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ─────────────────────────────────────────────
// Connect to MongoDB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// CORS — configurable via FRONTEND_URL env var
// LOCAL:      http://localhost:5173
// PRODUCTION: https://<your-frontend>.onrender.com
// ─────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

// Add production frontend URL if configured
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limiting – prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);

// Health check — used by Render and uptime monitors
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CharityChain Backend",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─────────────────────────────────────────────
// Start Server
// IMPORTANT: Listen on 0.0.0.0 for Render/Docker compatibility.
// process.env.PORT is provided by Render automatically.
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 CharityChain Backend running on port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
