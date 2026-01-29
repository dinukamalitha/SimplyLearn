import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { LogOut, BookOpen, GraduationCap, Users } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
      <div className={`p-3 rounded-lg w-fit mb-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back to your learning portal.</p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={BookOpen} 
            title="Active Courses" 
            value="4" 
            color="bg-blue-500/20 text-blue-500" 
          />
          <StatCard 
            icon={GraduationCap} 
            title="Assignments Due" 
            value="2" 
            color="bg-purple-500/20 text-purple-500" 
          />
          <StatCard 
            icon={Users} 
            title="Forum Activity" 
            value="12 New" 
            color="bg-green-500/20 text-green-500" 
          />
        </div>

        {/* Content Section Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-gray-400 text-center py-20">
            Select a course to view details
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
