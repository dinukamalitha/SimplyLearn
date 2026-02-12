import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, FileText, CheckCircle, ClipboardList, Clock } from 'lucide-react';

const iconMap = {
    BookOpen,
    GraduationCap,
    Users,
    FileText,
    CheckCircle,
    ClipboardList,
    Clock
};

const StatCard = ({ icon, title, value, color }) => {
    const Icon = iconMap[icon] || BookOpen;
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
        <div className={`p-3 rounded-lg w-fit mb-4 ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform">{value}</p>
      </div>
    );
};

const TutorDashboard = ({ user, stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{stats?.title || 'Tutor Dashboard'}</h1>
        <p className="text-gray-400 mt-2">Welcome back, {user?.name}. Manage your courses and students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats?.cards?.map((card, index) => (
            <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">Teaching Courses</h2>
                   {stats?.recentActivity?.length > 0 ? (
                      <div className="space-y-4">
                          {stats.recentActivity.map(course => (
                              <div key={course._id} className="bg-black/20 p-4 rounded-xl flex justify-between items-center group hover:bg-black/30 transition-colors">
                                  <div>
                                      <h3 className="font-bold text-lg group-hover:text-purple-400">{course.title}</h3>
                                      <p className="text-sm text-gray-400 truncate max-w-md">{course.description}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Link to={`/courses/${course._id}`} className="px-4 py-2 bg-white/10 hover:bg-purple-600 rounded-lg text-sm transition-colors">
                                        Manage
                                    </Link>
                                  </div>
                              </div>
                          ))}
                      </div>
                   ) : (
                       <div className="text-gray-400 py-8 text-center">
                          No courses created yet.
                          <br/>
                          <Link to="/courses" className="text-purple-400 hover:underline mt-2 inline-block">Create a Course</Link>
                       </div>
                   )}
              </div>
          </div>

          <div className="space-y-6">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                      <Link to="/courses" className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors">
                          Manage Courses
                      </Link>
                      <Link to="/profile" className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors">
                          Update Profile
                      </Link>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
