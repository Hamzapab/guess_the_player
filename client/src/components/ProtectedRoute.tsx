import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
