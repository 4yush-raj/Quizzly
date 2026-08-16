import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ResetPassword } from './pages/auth/ResetPassword';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { QuizCatalog } from './pages/student/QuizCatalog';
import { QuizDetails } from './pages/student/QuizDetails';
import { QuizRunner } from './pages/quiz/QuizRunner';
import { QuizResult } from './pages/quiz/QuizResult';
import { AttemptHistory } from './pages/student/AttemptHistory';
import { Leaderboard } from './pages/student/Leaderboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CategoryManager } from './pages/admin/CategoryManager';
import { QuizManager } from './pages/admin/QuizManager';
import { QuestionBankManager } from './pages/admin/QuestionBankManager';
import { StudentDirectory } from './pages/admin/StudentDirectory';

import { useParams } from 'react-router-dom';

function DynamicRedirect({ targetPath }) {
  const params = useParams();
  let path = targetPath;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return <Navigate to={path} replace />;
}

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-amber-50/80 to-rose-100/60 text-slate-900 flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/student/login" element={<Login portal="student" />} />
          <Route path="/admin/login" element={<Login portal="admin" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <ProtectedRoute>
                <QuizCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:id"
            element={
              <ProtectedRoute>
                <QuizDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz/:id/take"
            element={
              <ProtectedRoute>
                <QuizRunner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attempt/:id"
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute>
                <AttemptHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          {/* Legacy / Direct Student Route Redirects with Param Interpolation */}
          <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/quizzes" element={<Navigate to="/student/quizzes" replace />} />
          <Route path="/quiz/:id" element={<DynamicRedirect targetPath="/student/quiz/:id" />} />
          <Route path="/quiz/:id/take" element={<DynamicRedirect targetPath="/student/quiz/:id/take" />} />
          <Route path="/attempt/:id" element={<DynamicRedirect targetPath="/student/attempt/:id" />} />
          <Route path="/history" element={<Navigate to="/student/history" replace />} />
          <Route path="/leaderboard" element={<Navigate to="/student/leaderboard" replace />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CategoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <ProtectedRoute requireAdmin={true}>
                <QuizManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quizzes/:quizId/questions"
            element={
              <ProtectedRoute requireAdmin={true}>
                <QuestionBankManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requireAdmin={true}>
                <StudentDirectory />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/student/dashboard" replace />
                )
              ) : (
                <Navigate to="/student/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
