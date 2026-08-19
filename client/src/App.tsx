import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";   
import { useSocketStore } from './store/socketStore';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import { GameRoom } from './pages/GameRoom';
import './App.css';

function App() {
  const { isSignedIn ,getToken} = useAuth();            
  const { connect, disconnect, isConnected } = useSocketStore();

 useEffect(() => {
    const setupSocket = async () => {
      if (isSignedIn) {
        const token = await getToken();
        if (token) connect(token);
      } else {
        disconnect();
      }
    };
    setupSocket();
  }, [isSignedIn, getToken, connect, disconnect]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Section */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Route>
      </Routes>

      {/* Connection Indicator */}
      {isSignedIn && (
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
