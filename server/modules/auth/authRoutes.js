const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyEmail,
  resendOTP,
  logoutUser
} = require("./authController");
const { protect } = require("../../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, require("./authController").updateProfile);
router.get("/logout", logoutUser);

module.exports = router;
