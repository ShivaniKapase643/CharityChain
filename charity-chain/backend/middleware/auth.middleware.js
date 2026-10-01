/**
 * Authentication & Authorization middleware
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

/**
 * protect — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized — no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * authorizeRoles(...roles) — restrict to specific roles after protect
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — role '${req.user.role}' not authorized`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
