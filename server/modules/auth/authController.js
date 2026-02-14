const mongoose = require('mongoose');
const User = require('./User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate & normalize inputs
    if (typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Safe email regex (prevents super-linear backtracking)
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const safeName = typeof name === "string" ? name.trim() : "";
    const allowedRoles = ["Student", "Tutor", "Admin"];
    const safeRole = allowedRoles.includes(role) ? role : "Student";

    // Check if user already exists 
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user using sanitized values
    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password_hash,
      role: safeRole
    });

    if (user) {
      return res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }

    res.status(400).json({ message: "Invalid user data" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate & normalize input
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Query using trusted value
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    }

    res.status(401).json({ message: "Invalid email or password" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_data: user.profile_data
      });
    } else {
      res.status(404).json({ message: 'User found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private

// Helper: sanitize string or return default
const sanitizeString = (value, defaultValue = "") =>
  typeof value === "string" ? value.trim() : defaultValue;

// Helper: sanitize array of strings
const sanitizeStringArray = (arr, defaultValue = []) =>
  Array.isArray(arr) ? arr.map((s) => String(s).trim()) : defaultValue;

// Helper: validate email safely
const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
  return emailRegex.test(normalized) ? normalized : false;
};

const updateProfile = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const safeUserId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(safeUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic fields
    if (req.body.name !== undefined) user.name = sanitizeString(req.body.name, user.name);

    if (req.body.email !== undefined) {
      const normalizedEmail = isValidEmail(req.body.email);
      if (normalizedEmail) user.email = normalizedEmail;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(req.body.password, salt);
    }

    // Update profile_data
    if (req.body.profile_data && typeof req.body.profile_data === "object") {
      const { bio, skills, interests } = req.body.profile_data;
      user.profile_data = {
        ...user.profile_data,
        bio: sanitizeString(bio, user.profile_data.bio),
        skills: sanitizeStringArray(skills, user.profile_data.skills),
        interests: sanitizeStringArray(interests, user.profile_data.interests),
      };
    }

    const updatedUser = await user.save();

    // Return updated user
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

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
