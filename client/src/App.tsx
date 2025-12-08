import { useEffect } from 'react';
import { AppRouter } from './router';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import './App.css';

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();
  const { connect, disconnect, isConnected } = useSocketStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      <AppRouter />
      <div
        className={`fixed bottom-4 right-4 w-4 h-4 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        } border-2 border-white shadow-md transition-colors duration-300`}
        title={isConnected ? 'Connected' : 'Disconnected'}
      />
    </div>
  );
}

export default App;
