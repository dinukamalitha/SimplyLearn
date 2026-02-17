const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/sendEmail");

// --------------------------------------------------

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// --------------------------------------------------
// helpers

const normalizeAndValidateEmail = (email) => {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
  return emailRegex.test(normalized) ? normalized : null;
};

// --------------------------------------------------
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const normalizedEmail = normalizeAndValidateEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const safeName = typeof name === "string" ? name.trim() : "";

    const allowedRoles = ["Student", "Tutor", "Admin"];
    const safeRole = allowedRoles.includes(role) ? role : "Student";

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password_hash,
      role: safeRole,
      otp_code: otp,
      otp_expires_at,
      is_verified: false,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "SimplyLearn Email Verification",
        text: `<h1>Email Verification</h1><p>Your OTP is: <b>${otp}</b></p>`,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }

    return res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const normalizedEmail = normalizeAndValidateEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.lock_until && user.lock_until > Date.now()) {
      const waitTime = Math.ceil((user.lock_until - Date.now()) / 60000);
      return res.status(403).json({
        message: `Account is temporarily locked. Please try again in ${waitTime} minutes.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      if (user.is_verified === false) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }

      user.failed_login_attempts = 0;
      user.lock_until = undefined;
      await user.save();

      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    }

    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    if (user.failed_login_attempts >= 3) {
      user.lock_until = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      return res.status(403).json({
        message:
          "Account locked due to too many failed login attempts. Please try again in 5 minutes.",
      });
    }

    await user.save();
    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private

const getProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(safeUserId);

    if (!user) {
      return res.status(404).json({ message: "User found" });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_data: user.profile_data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// helpers for update

const sanitizeString = (value, defaultValue = "") =>
  typeof value === "string" ? value.trim() : defaultValue;

const sanitizeStringArray = (arr, defaultValue = []) =>
  Array.isArray(arr) ? arr.map((s) => String(s).trim()) : defaultValue;

const isValidEmail = (email) => {
  const normalized = normalizeAndValidateEmail(email);
  return normalized;
};

// --------------------------------------------------
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

const updateProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeUserId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(safeUserId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) {
      user.name = sanitizeString(req.body.name, user.name);
    }

    if (req.body.email !== undefined) {
      const normalizedEmail = isValidEmail(req.body.email);
      if (normalizedEmail) user.email = normalizedEmail;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.profile_data && typeof req.body.profile_data === "object") {
      const { bio, skills, interests } = req.body.profile_data;

      user.profile_data = {
        ...user.profile_data,
        bio: sanitizeString(bio, user.profile_data?.bio),
        skills: sanitizeStringArray(skills, user.profile_data?.skills),
        interests: sanitizeStringArray(interests, user.profile_data?.interests),
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profile_data: updatedUser.profile_data,
      token: generateToken(updatedUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// @desc    Verify OTP
// @route   POST /api/auth/verify-email
// @access  Public

const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const normalizedEmail = normalizeAndValidateEmail(email);

    if (!normalizedEmail || typeof otp !== "string") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (
      user.otp_code !== otp ||
      !user.otp_expires_at ||
      user.otp_expires_at < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.is_verified = true;
    user.otp_code = undefined;
    user.otp_expires_at = undefined;

    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = normalizeAndValidateEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    user.otp_code = otp;
    user.otp_expires_at = otp_expires_at;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "SimplyLearn Email Verification (Resend)",
      text: `<h1>Email Verification</h1><p>Your new OTP is: <b>${otp}</b></p>`,
    });

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------------------------------

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyEmail,
  resendOTP,
};