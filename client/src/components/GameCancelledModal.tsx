import { Clock, Home } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


export const GameCancelledModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const gameCancled = useGameStore((state) => state.gameCancled);
  // const setRoomState = useGameStore((state) => state.setRoomState);



  // Only render when matchmaking has been flagged as cancelled/timed out
  if (!gameCancled) return null;

  const handleGoHome = () => {
     navigate('/', { replace: true });
  };


  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">


        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl pointer-events-none bg-amber-500/15" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none bg-slate-500/15" />

        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-900/40 to-slate-800 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-xl">
            <Clock size={40} strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {t("gameCancelled.badge")}
            </span>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-wide my-4">
              {t("gameCancelled.title")}
            </h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              {t("gameCancelled.message")}
            </p>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-slate-800/80" />

        <div className="flex gap-3">
          <button
            onClick={handleGoHome}
            className="flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-slate-950/50"
          >
            <Home size={18} />
            <span>{t("gameOver.returnHome")}</span>
          </button>


        </div>
      </div>
    </div>
  );
};