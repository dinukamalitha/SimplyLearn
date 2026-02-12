const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
} = require("./authController");
const { protect } = require("../../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put(
  "/profile",
  protect,
  require("./authController").updateProfile,
);

module.exports = router;
