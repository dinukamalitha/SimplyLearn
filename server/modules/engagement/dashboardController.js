const mongoose = require('mongoose');
const User = require('../auth/User');
const Course = require('../courses/Course');
const Assignment = require('../assignments/Assignment');
const Submission = require('../assignments/Submission');
const Enrollment = require('./Enrollment');

// @desc    Get dashboard statistics based on user role
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const { role, id } = req.user;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const safeUserId = new mongoose.Types.ObjectId(id);
        let stats = {};

        if (role === 'Admin') {
            const totalUsers = await User.countDocuments();
            const totalCourses = await Course.countDocuments();
            const totalAssignments = await Assignment.countDocuments();
            const totalSubmissions = await Submission.countDocuments();

            stats = {
                title: 'System Overview',
                cards: [
                    { title: 'Total Users', value: totalUsers, icon: 'Users', color: 'bg-blue-500/20 text-blue-500' },
                    { title: 'Total Courses', value: totalCourses, icon: 'BookOpen', color: 'bg-green-500/20 text-green-500' },
                    { title: 'Total Assignments', value: totalAssignments, icon: 'FileText', color: 'bg-purple-500/20 text-purple-500' },
                    { title: 'Submissions', value: totalSubmissions, icon: 'CheckCircle', color: 'bg-yellow-500/20 text-yellow-500' }
                ]
            };
        } else if (role === 'Tutor') {
            // Courses taught by this tutor
            const myCourses = await Course.find({ tutor_id: safeUserId });
            const courseIds = myCourses.map(c => c._id);

            const totalStudents = await Enrollment.countDocuments({ course_id: { $in: courseIds } });

            // Find assignments for my courses
            const myAssignments = await Assignment.find({ course_id: { $in: courseIds } });
            const assignmentIds = myAssignments.map(a => a._id);

            // Find ungrouped submissions
            const pendingGrading = await Submission.countDocuments({
                assignment_id: { $in: assignmentIds },
                grade: { $exists: false }
            });

            stats = {
                title: 'Instructor Dashboard',
                cards: [
                    { title: 'My Courses', value: myCourses.length, icon: 'BookOpen', color: 'bg-blue-500/20 text-blue-500' },
                    { title: 'Total Students', value: totalStudents, icon: 'Users', color: 'bg-green-500/20 text-green-500' },
                    { title: 'Pending Grading', value: pendingGrading, icon: 'ClipboardList', color: 'bg-red-500/20 text-red-500' }
                ],
                recentActivity: myCourses.slice(0, 5) // Send recent courses
            };
        } else {
            // Student
            const enrollments = await Enrollment.find({ student_id: safeUserId }).populate('course_id');
            const enrolledCourseIds = enrollments
                .map(e => e.course_id?._id)
                .filter(id => id); // Filter out nulls if a course was deleted

            // Assignments due in the future for my courses
            const assignmentsDue = await Assignment.countDocuments({
                course_id: { $in: enrolledCourseIds },
                deadline: { $gt: new Date() }
            });

            // My submissions
            const mySubmissions = await Submission.countDocuments({ student_id: safeUserId });

            stats = {
                title: 'Student Dashboard',
                cards: [
                    { title: 'Enrolled Courses', value: enrollments.length, icon: 'BookOpen', color: 'bg-blue-500/20 text-blue-500' },
                    { title: 'Upcoming Assignments', value: assignmentsDue, icon: 'Clock', color: 'bg-purple-500/20 text-purple-500' },
                    { title: 'Completed Submissions', value: mySubmissions, icon: 'CheckCircle', color: 'bg-green-500/20 text-green-500' }
                ],
                enrolledCourses: enrollments.map(e => e.course_id).filter(c => c)
            };
        }

        res.json(stats);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardStats };
