import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store.js';
import { PageLoader } from '../ui/LoadingSpinner.jsx';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, accessToken, isInitialized } = useAuthStore();

  if (!isInitialized) return <PageLoader />;
  if (!accessToken) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
