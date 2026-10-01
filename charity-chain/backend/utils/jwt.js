const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for the given user document.
 * Expires in 7 days.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = { generateToken };
