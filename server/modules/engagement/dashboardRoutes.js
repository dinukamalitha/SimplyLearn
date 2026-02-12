const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('./dashboardController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, getDashboardStats);

module.exports = router;
