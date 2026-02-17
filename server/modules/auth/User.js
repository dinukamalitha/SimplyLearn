const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Tutor", "Student"],
      default: "Student",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    otp_code: {
      type: String,
    },
    otp_expires_at: {
      type: Date,
    },
    profile_data: {
      avatar: { type: String, default: "" },
      bio: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
