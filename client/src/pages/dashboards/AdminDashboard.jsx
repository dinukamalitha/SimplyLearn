import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, FileText, CheckCircle, ClipboardList, Clock, ShieldCheck, UserCog } from 'lucide-react';

const iconMap = {
    BookOpen,
    GraduationCap,
    Users,
    FileText,
    CheckCircle,
    ClipboardList,
    Clock,
    ShieldCheck,
    UserCog
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

const AdminDashboard = ({ user, stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                {stats?.title || 'Admin Control Center'}
            </h1>
            <p className="text-gray-400 mt-2">System overview for Administrator {user?.name}.</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-full flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-semibold text-sm">System Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats?.cards?.map((card, index) => (
            <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">System Activity</h2>
                   <div className="text-gray-400 py-12 text-center bg-black/20 rounded-xl border border-dashed border-gray-700">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>User activity and system logs will appear here.</p>
                        <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                            View Detailed Logs
                        </button>
                   </div>
              </div>
          </div>

          <div className="space-y-6">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Admin Actions</h2>
                  <div className="space-y-3">
                      <button className="flex items-center space-x-3 w-full py-3 px-4 bg-white/5 hover:bg-red-600/20 hover:border-red-600/50 border border-transparent rounded-lg text-left transition-all group">
                          <UserCog className="w-5 h-5 group-hover:text-red-500" />
                          <span>Manage All Users</span>
                      </button>
                      <button className="flex items-center space-x-3 w-full py-3 px-4 bg-white/5 hover:bg-orange-600/20 hover:border-orange-600/50 border border-transparent rounded-lg text-left transition-all group">
                          <BookOpen className="w-5 h-5 group-hover:text-orange-500" />
                          <span>Audit Courses</span>
                      </button>
                      <Link to="/profile" className="flex items-center space-x-3 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-transparent rounded-lg text-left transition-all">
                          <span>Admin Profile</span>
                      </Link>
                  </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-2">System Status</h2>
                  <div className="flex items-center space-x-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">All systems operational</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
