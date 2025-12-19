import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Game from './pages/Game';
import './App.css';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
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

  // Loading state is now handled within ProtectedRoute for protected paths,
  // or we could keep a global loader here. 
  // For the requested flow, ProtectedRoute handles the check for redirect.

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Section */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/game/:roomId" element={<Game />} />
        </Route>
      </Routes>

      {/* Connection Indicator (only show if authenticated maybe? or always?) */}
      {isAuthenticated && (
        <div
          className={`fixed bottom-4 right-4 w-4 h-4 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } border-2 border-white shadow-md transition-colors duration-300`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      )}
    </div>
  );
}

export default App;

