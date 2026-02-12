const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse } = require('./courseController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, updateCourse);

module.exports = router;
