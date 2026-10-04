import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from "@clerk/clerk-react";
import { createGame } from '../api/gameApi';
import { Header } from "../components/Header";
import { CirclePlus, DoorOpen } from "lucide-react";
import { Zap, Users, Search, Loader2 } from "lucide-react"
import { useTranslation } from 'react-i18next';
import { Footer } from '../components/Footer';
import { useGameStore } from '../store/useGameStore';
// import ambieant_pitch from '../assets/ambieant_pitch.png'

const Home = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { user } = useUser();

  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>('en');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();
  const setRoomState = useGameStore((state) => state.setRoomState);

  useEffect(() => {
    setRoomState({
      roomId: null,
      status: null,
      myTargetCard: null,
      winnerId: null,
      gameCancled: false,
    });
  }, []);

  const handleCreateGame = async () => {

    setIsCreating(true);
    setError('');
    try {
      const token = await getToken();
      const { roomId } = await createGame(language, token);
      navigate(`/game/${roomId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Failed to create game');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    // TO-DO : If Room code do not exisit in DB show error
    if (!roomCode.trim()) return;
    navigate(`/game/${roomCode.trim()}`);
  };

  const username = user?.username || "Guest";

  return (
    <div id='home' className='min-h-screen flex flex-col'>
      <Header />
      <div className="min-h-screen flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
              {t("header.title")}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-2">
              {t("home.challenge")}
            </p>
            <p className="text-slate-500 font-medium">
              {t("home.welcome")}, <span className="text-blue-400">{username}</span>
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
                <CirclePlus className="text-blue-500" size={24} />
                {t("home.createMatch")}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2"> {t("home.selectLeague")}</label>
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
                  {isCreating ? t("home.creatingArena") : t("home.createMatch")}
                </button>
              </div>
            </div>

            {/* Join Match Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl group">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DoorOpen className="text-green-500" size={24} />
                {t("home.joinMatch")}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t("home.enterRoomCode")}</label>
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
                  {t("home.joinArena")}
                </button>
              </div>
            </div>

            {/* quick Match */}

            {/* Expects in scope: t, onlinePlayers (number), isSearching (boolean), handleFindMatch () => void */}
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
                      {t("home.playersOnline")}
                    </span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">~5s {t("home.wait")}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t("home.quickMatchDescription")}
                  </p>
                </div>

                {/* CTA */}
                <button
                  // onClick={}
                  // disabled={}
                  className="w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> */}
                  {t("home.findMatch")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;



