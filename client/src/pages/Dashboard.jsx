import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../API/api';
import StudentDashboard from './dashboards/StudentDashboard';
import TutorDashboard from './dashboards/TutorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard');
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white text-center py-20">Loading dashboard...</div>;

  switch (user?.role) {
    case 'Student':
      return <StudentDashboard user={user} stats={stats} />;
    case 'Tutor':
      return <TutorDashboard user={user} stats={stats} />;
    case 'Admin':
      return <AdminDashboard user={user} stats={stats} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center text-white">
          <p>Unknown role: {user?.role}</p>
        </div>
      );
  }
};

export default Dashboard;
