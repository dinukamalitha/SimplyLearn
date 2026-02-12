import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../API/api';
import AuthContext from '../../context/AuthContext';
import { Plus, Search, Book } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const { user } = useContext(AuthContext);

  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'Student') {
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get('/enrollments/my');
      setEnrollments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnroll = async (courseId, e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    try {
      await api.post('/enrollments', { course_id: courseId });
      fetchEnrollments(); // Refresh
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setShowCreateModal(false);
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (error) {
      alert('Failed to create course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-gray-400 mt-2">Explore and manage your learning materials</p>
        </div>
        {(user?.role === 'Tutor' || user?.role === 'Admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-bold transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Create Course
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isEnrolled = enrollments.some(e => e.course_id?._id === course._id);
            return (
              <div key={course._id} className="relative group">
                <Link to={`/courses/${course._id}`} className="block h-full">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Book className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <span>{course.tutor_id?.name || 'Unknown Tutor'}</span>
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
                {user?.role === 'Student' && !isEnrolled && (
                  <button
                    onClick={(e) => handleEnroll(course._id, e)}
                    className="absolute top-6 right-6 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-lg z-10 transition-colors"
                  >
                    Enroll
                  </button>
                )}
                {user?.role === 'Student' && isEnrolled && (
                  <span className="absolute top-6 right-6 px-3 py-1 bg-white/10 text-green-400 text-xs font-bold rounded border border-green-500/30 z-10">
                    Enrolled
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1d2d] rounded-2xl p-8 w-full max-w-md border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
