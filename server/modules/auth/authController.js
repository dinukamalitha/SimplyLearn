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
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const safeName = typeof name === "string" ? name.trim() : "";
    const allowedRoles = ["Student", "Tutor", "Admin"];
    const safeRole = allowedRoles.includes(role) ? role : "Student";

    // Query using trusted value only
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
  // req.user will be set by middleware
  const user = await User.findById(req.user.id);
  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_data: user.profile_data
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.profile_data) {
      user.profile_data = { ...user.profile_data, ...req.body.profile_data };
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
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
