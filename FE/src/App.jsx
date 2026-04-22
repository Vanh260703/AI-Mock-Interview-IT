import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './store/auth.store.js';
import { useNotificationStore } from './store/notification.store.js';
import { setAuthHandlers } from './api/axios.js';
import { userApi } from './api/user.api.js';
import { connectSocket, disconnectSocket, getSocket } from './lib/socket.js';

// Layouts
import AuthLayout    from './components/layout/AuthLayout.jsx';
import AppLayout     from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Auth pages
import LoginPage         from './pages/auth/LoginPage.jsx';
import RegisterPage      from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage   from './pages/auth/ResetPasswordPage.jsx';
import VerifySuccessPage   from './pages/auth/VerifySuccessPage.jsx';

// App pages
import DashboardPage     from './pages/dashboard/DashboardPage.jsx';
import SetupPage         from './pages/interview/SetupPage.jsx';
import SessionPage       from './pages/interview/SessionPage.jsx';
import ResultPage        from './pages/interview/ResultPage.jsx';
import HistoryPage       from './pages/history/HistoryPage.jsx';
import HistoryDetailPage from './pages/history/HistoryDetailPage.jsx';
import ProfilePage       from './pages/profile/ProfilePage.jsx';
import QuestionBankPage  from './pages/questions/QuestionBankPage.jsx';
import FriendsPage       from './pages/friends/FriendsPage.jsx';
import MessagesPage      from './pages/messages/MessagesPage.jsx';

// Admin pages
import AdminUsersPage  from './pages/admin/AdminUsersPage.jsx';
import AdminSystemPage from './pages/admin/AdminSystemPage.jsx';

const App = () => {
  const { setSession, setInitialized, setToken, logout, accessToken, user } = useAuthStore();
  const { addNotification } = useNotificationStore();

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
    const restore = async () => {
      try {
        const refreshRes = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const { accessToken } = refreshRes.data;

        // Wire token vào store trước để userApi có thể dùng
        useAuthStore.getState().setToken(accessToken);

        // Lấy full user profile
        const userRes = await userApi.getMe();
        setSession(userRes.data.data.user, accessToken);
      } catch {
        setInitialized();
      }
    };
    restore();
  }, []);

  // Socket.IO lifecycle — connect khi đã có token, disconnect khi logout
  useEffect(() => {
    if (!accessToken || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const onFriendRequest = ({ requestId, from }) => {
      addNotification({
        id: requestId,
        type: 'friend_request',
        message: `${from.username ?? from.email} đã gửi lời mời kết bạn`,
        data: { requestId, from },
      });
      toast(`${from.username ?? from.email} muốn kết bạn với bạn`, {
        icon: '👤',
        duration: 4000,
      });
    };

    const onFriendAccepted = ({ requestId, by }) => {
      addNotification({
        id: `acc_${requestId}`,
        type: 'friend_accepted',
        message: `${by.username ?? by.email} đã chấp nhận lời mời kết bạn`,
        data: { requestId, by },
      });
      toast.success(`${by.username ?? by.email} đã trở thành bạn bè của bạn!`);
    };

    const onChatMessage = ({ conversationId, message }) => {
      const sender = message.sender?.username ?? message.sender?.email ?? 'Ai đó';
      addNotification({
        id: `msg_${message._id}`,
        type: 'chat_message',
        message: `${sender}: ${message.content.slice(0, 60)}${message.content.length > 60 ? '…' : ''}`,
        data: { conversationId, message },
      });
      // Chỉ toast khi không đang ở trang /messages
      if (!window.location.pathname.startsWith('/messages')) {
        toast(`${sender}: ${message.content.slice(0, 40)}${message.content.length > 40 ? '…' : ''}`, {
          icon: '💬',
          duration: 4000,
        });
      }
    };

    socket.on('friend:request',  onFriendRequest);
    socket.on('friend:accepted', onFriendAccepted);
    socket.on('chat:message',    onChatMessage);

    return () => {
      socket.off('friend:request',  onFriendRequest);
      socket.off('friend:accepted', onFriendAccepted);
      socket.off('chat:message',    onChatMessage);
    };
  }, [accessToken, user]);

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
        {/* Email verify auto-login — standalone, no layout */}
        <Route path="/verify-success" element={<VerifySuccessPage />} />

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
            <Route path="/community"               element={<FriendsPage />} />
            <Route path="/messages"               element={<MessagesPage />} />
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
