/**
 * User Model
 * Stores application-level user data (off-chain).
 * Passwords are hashed with bcrypt — never stored in plain text.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["donor", "charity", "admin"],
      default: "donor",
    },
    // Ethereum wallet address — optional for donors, required for charities
    walletAddress: {
      type: String,
      default: null,
      lowercase: true,
    },
    // Reference to Charity document (only for role=charity)
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
