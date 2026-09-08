import { Trophy, Frown, Home, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

export const GameOverModal = () => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const currentUserId = userId;
  
  const winnerId = useGameStore((state) => state.winnerId);
  const status = useGameStore((state) => state.status);
  const latestAction = useGameStore((state) => 
    state.history.length > 0 ? state.history[state.history.length - 1].action : null
  );
  const setRoomState = useGameStore((state) => state.setRoomState);

  // Only show  when the game status is 'finished'
  if (status !== 'finished') return null;

  const isWinner = winnerId === currentUserId;

  const handleGoHome = () => {
    setRoomState({ roomId: null, status: null, myTargetCard: null, winnerId: null });
    window.location.href = '/';
  };

  let winText;
  
  if (latestAction === 'surrender') {
    winText = t("gameOver.quitWin");
  } else {
    winText = t("gameOver.deductionWin");
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Dynamic Background Glow Effect */}
        <div
          className={`absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
            isWinner ? 'bg-amber-500/20' : 'bg-red-500/15'
          }`}
        />
        <div
          className={`absolute -bottom-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
            isWinner ? 'bg-emerald-500/20' : 'bg-rose-500/15'
          }`}
        />

        {/*  VICTORY CASE */}
        {isWinner ? (
          <div className="space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-50" />
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 border-2 border-amber-300">
                <Trophy size={42} strokeWidth={2.5} />
              </div>
              <Sparkles className="absolute -top-1 -right-1 text-amber-300 animate-pulse" size={24} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {t("gameOver.victory")}
              </span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-wide mt-3">
                {t("gameOver.congratulations")}
              </h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {winText}
              </p>
            </div>
          </div>
        ) : (
          /* DEFEAT CASE */
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-900/50 to-slate-800 border-2 border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 shadow-xl">
              <Frown size={40} strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {t("gameOver.defeat")}
              </span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-wide">
                {t("gameOver.gameOver")}
              </h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {t("gameOver.lossMessage")}
              </p>
            </div>
          </div>
        )}

  
        <div className="my-6 h-px w-full bg-slate-800/80" />

        <button
          onClick={handleGoHome}
          className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
            isWinner
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-slate-950/50'
          }`}
        >
          <Home size={18} />
          <span>{t("gameOver.returnHome")}</span>
        </button>
      </div>
    </div>
  );
};