import React, { useEffect  } from 'react';
import { Zap, Users, Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
import { useSocketStore } from '../store/socketStore';
import { useNavigate } from 'react-router-dom';


interface QuickMatchCard {
 isSearching : boolean,
 setIsSearching : (isSearching: boolean) => void,
}

export const QuickMatchCard: React.FC<QuickMatchCard> = ({
  isSearching,
  setIsSearching,  
}) => {
  const { t } = useTranslation();
  const socket = useSocketStore((state) => state.socket);
  const onlineCount = useSocketStore((state) => state.onlineCount);
  const setOnlineCount = useSocketStore((state) => state.setOnlineCount);
  const navigate = useNavigate();

   useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: { roomId: string }) => {
      console.log('Match found! Room ID:', data.roomId);

      navigate(`/game/${data.roomId}`);
      
      // 1. Close the searching modal
      setIsSearching(false);
      
      // 2. MAGIC HANDOFF: Automatically emit your existing join_room event!
      // This routes the user right back into your existing game logic flawlessly.
      socket.emit('join_room', { roomId: data.roomId });
    };

    socket.on('match_found', handleMatchFound);

    return () => {
      socket.off('match_found', handleMatchFound);
    };
  }, [socket]);

  // Handle clicking "Find Match"
  const handleStartSearch = () => {
    if (!socket) return;
    setIsSearching(true);
    socket.emit('join_matchmaking');
  };



  // Sync real-time online player count
  useEffect(() => {
    if (!socket) return;

    const handleCountUpdate = (data: { count: number }) => {
      setOnlineCount(data.count);
    };

    socket.on('online_count_update', handleCountUpdate);

    return () => {
      socket.off('online_count_update', handleCountUpdate);
    };
  }, [socket, setOnlineCount]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl group">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-cyan-500/10 border border-cyan-400/30">
            <Zap className="text-cyan-400" size={22} />
          </span>
          {t("home.quickMatch")}
        </h2>

        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {t("home.live")}
        </span>
      </div>

      <div className="space-y-6">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {t("home.automatedMatchmaking")}
        </p>

        {/* Info box */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-slate-200">
              <Users className="text-cyan-400" size={18} />
              {/* Display the live count here */}
              <span className="font-bold">{onlineCount}</span> {t("home.playersOnline")}
            </span>
            <span className="text-cyan-400 font-mono font-bold text-sm">~5s {t("home.wait")}</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t("home.quickMatchDescription")}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStartSearch}
          disabled={isSearching}
          className="w-full cursor-pointer py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {isSearching ? t("home.searching") : t("home.findMatch")}
        </button>
      </div>
    </div>
  );
};