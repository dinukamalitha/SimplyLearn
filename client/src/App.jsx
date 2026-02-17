import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./modules/auth/Login";
import Dashboard from "./modules/engagement/Dashboard";
import Profile from "./modules/auth/Profile";
import Courses from "./modules/courses/Courses";
import Assignments from "./modules/assignments/Assignments";
import CourseDetails from "./modules/courses/CourseDetails";
import CreateAssignment from "./modules/assignments/CreateAssignment";
import AssignmentDetails from "./modules/assignments/AssignmentDetails";
import CreateQuiz from "./modules/quizzes/CreateQuiz";
import TakeQuiz from "./modules/quizzes/TakeQuiz";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import VerifyEmail from "./modules/auth/VerifyEmail";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route
              path="/courses/:courseId/create-assignment"
              element={
                <ProtectedRoute allowedRoles={["Tutor", "Admin"]}>
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route path="/assignments/:id" element={<AssignmentDetails />} />
            <Route
              path="/courses/:courseId/create-quiz"
              element={
                <ProtectedRoute allowedRoles={["Tutor", "Admin"]}>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />
            <Route path="/quizzes/:id" element={<TakeQuiz />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
