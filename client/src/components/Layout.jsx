import { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5';

  return (
    <div className="min-h-screen bg-[#0f1118]">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0f1118]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                SimplyLearn
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/')}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/courses" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/courses')}`}>
                  <BookOpen className="w-4 h-4" /> Courses
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
