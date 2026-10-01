const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Model
 * Stores application-layer user data (off-chain).
 * Passwords are hashed with bcrypt — never stored in plain text.
 * walletAddress links this user to their blockchain identity.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: ["donor", "charity", "admin"],
      default: "donor",
    },
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    // For charity users, link to Charity document
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
