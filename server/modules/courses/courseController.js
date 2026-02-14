const mongoose = require('mongoose');
const Course = require('./Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (All roles)
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('tutor_id', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const safeCourseId = new mongoose.Types.ObjectId(id);

    const course = await Course.findById(safeCourseId).populate('tutor_id', 'name');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Tutor/Admin)
const createCourse = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  if (req.user.role === 'Student') {
    return res.status(403).json({ message: 'Not authorized to create courses' });
  }

  try {
    const course = new Course({
      title,
      description,
      tutor_id: req.user.id,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Owner/Admin)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const safeCourseId = new mongoose.Types.ObjectId(id);

    const course = await Course.findById(safeCourseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.tutor_id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;

    if (req.body.materials) {
      if (Array.isArray(req.body.materials)) {
        course.materials = [...course.materials, ...req.body.materials];
      } else {
        course.materials.push(req.body.materials);
      }
    }

    const updatedCourse = await course.save();
    res.json(updatedCourse);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse
};
