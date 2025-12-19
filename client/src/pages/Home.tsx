import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createGame } from '../api/gameApi';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError('');
    try {
      const { roomId } = await createGame(language);
      navigate(`/game/${roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (!roomCode.trim()) return;
    navigate(`/game/${roomCode.trim()}`);
  };

  const username = user?.username || "Guest";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      
      {/* Navbar / Top Actions */}
      <div className="absolute top-6 right-6">
         <button 
          onClick={logout}
          className="text-red-400 hover:text-red-300 font-medium transition-colors text-sm"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Guess The Player
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-2">
            Test your football knowledge against friends.
          </p>
           <p className="text-slate-500 font-medium">
            Welcome, <span className="text-blue-400">{username}</span>
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Create Match Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl group">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">Create</span>
              Create Match
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select League / Language</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-white appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <option value="en">English (Premier League)</option>
                    <option value="fr">Français (Ligue 1)</option>
                    <option value="ar">Arabic (Saudi League)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating Arena...' : 'Create Match'}
              </button>
            </div>
          </div>

          {/* Join Match Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl group">
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm">Join</span>
              Join Match
            </h2>

            <div className="space-y-6">
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Enter Room Code</label>
                <input
                  type="text"
                  placeholder="e.g. 8X2A"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder-slate-600 text-center tracking-widest font-mono uppercase"
                />
              </div>

              <button
                onClick={handleJoinGame}
                disabled={!roomCode.trim()}
                className="w-full py-4 bg-transparent border-2 border-slate-600 hover:border-emerald-500 hover:text-emerald-400 text-slate-300 rounded-xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/10"
              >
                Join Arena
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;



