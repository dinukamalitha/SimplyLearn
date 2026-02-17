const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('./courseController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, updateCourse)
    .delete(protect, restrictTo('Tutor'), deleteCourse);

module.exports = router;
