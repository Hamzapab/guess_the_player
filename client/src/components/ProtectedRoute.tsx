import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";

const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
