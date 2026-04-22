import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from './store/auth.store.js';
import { setAuthHandlers } from './api/axios.js';

// Layouts
import AuthLayout    from './components/layout/AuthLayout.jsx';
import AppLayout     from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Auth pages
import LoginPage         from './pages/auth/LoginPage.jsx';
import RegisterPage      from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage.jsx';

// App pages
import DashboardPage     from './pages/dashboard/DashboardPage.jsx';
import SetupPage         from './pages/interview/SetupPage.jsx';
import SessionPage       from './pages/interview/SessionPage.jsx';
import ResultPage        from './pages/interview/ResultPage.jsx';
import HistoryPage       from './pages/history/HistoryPage.jsx';
import HistoryDetailPage from './pages/history/HistoryDetailPage.jsx';
import ProfilePage       from './pages/profile/ProfilePage.jsx';
import QuestionBankPage  from './pages/questions/QuestionBankPage.jsx';

// Admin pages
import AdminUsersPage  from './pages/admin/AdminUsersPage.jsx';
import AdminSystemPage from './pages/admin/AdminSystemPage.jsx';

const App = () => {
  const { setSession, setInitialized, setToken, logout } = useAuthStore();

  // Wire auth handlers into axios (avoids circular dependency)
  useEffect(() => {
    setAuthHandlers(
      () => useAuthStore.getState().accessToken,
      (token) => useAuthStore.getState().setToken(token),
      () => useAuthStore.getState().logout(),
    );
  }, []);

  // Try to restore session via refresh token on mount
  useEffect(() => {
    axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
      .then((res) => {
        // Fetch user info — if refresh works, we have an access token
        // We store the token; user info comes from the token payload or we keep it minimal
        const { accessToken } = res.data;
        // Decode minimal user info from JWT payload (non-sensitive)
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          setSession({ id: payload.id, role: payload.role }, accessToken);
        } catch {
          setInitialized();
        }
      })
      .catch(() => setInitialized());
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: 12, fontSize: 14 },
        }}
      />
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"                   element={<LoginPage />} />
          <Route path="/register"                element={<RegisterPage />} />
          <Route path="/forgot-password"         element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />
        </Route>

        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/"                        element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"               element={<DashboardPage />} />
            <Route path="/interview/setup"         element={<SetupPage />} />
            <Route path="/interview/:id/results"   element={<ResultPage />} />
            <Route path="/history"                 element={<HistoryPage />} />
            <Route path="/history/:id"             element={<HistoryDetailPage />} />
            <Route path="/profile"                 element={<ProfilePage />} />
            <Route path="/questions"               element={<QuestionBankPage />} />
          </Route>
          {/* Session page — full screen, no sidebar */}
          <Route path="/interview/:id"             element={<SessionPage />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/users"   element={<AdminUsersPage />} />
            <Route path="/admin/system"  element={<AdminSystemPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
