import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import CourseDetails from './pages/CourseDetails';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetails from './pages/AssignmentDetails';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses/:courseId/create-assignment" element={<ProtectedRoute allowedRoles={['Tutor', 'Admin']}><CreateAssignment /></ProtectedRoute>} />
            <Route path="/assignments/:id" element={<AssignmentDetails />} />
            <Route path="/courses/:courseId/create-quiz" element={<ProtectedRoute allowedRoles={['Tutor', 'Admin']}><CreateQuiz /></ProtectedRoute>} />
            <Route path="/quizzes/:id" element={<TakeQuiz />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
