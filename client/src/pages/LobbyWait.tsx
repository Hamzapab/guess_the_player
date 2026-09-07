import { useState } from 'react';
import { Loader2, X, Copy, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useSocketStore } from '../store/socketStore';
import { Header } from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const WaitingLobby = () => {
  const { t } = useTranslation();
  const socket = useSocketStore((state) => state.socket);
  const roomId = useGameStore((state) => state.roomId);
  const setRoomState = useGameStore((state) => state.setRoomState);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    if (socket && roomId) {
      socket.emit('leave_room', { roomId });
      navigate("/")
    }
    // Reset back 
    setRoomState({ roomId: null, status: null });
  };

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">

          <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping opacity-75" />
            <div className="absolute inset-1 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
              <Loader2 size={22} className="animate-spin" />
            </div>
          </div>

    
          <h2 className="text-2xl font-black text-white uppercase italic tracking-wide mb-2">
            {t("gameRoom.waitingOpponent")}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {t("gameRoom.autoStart")}
          </p>

          {roomId && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-6 flex items-center justify-between">
              <div className="text-left pl-1">
                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t("gameRoom.roomCode")}</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{roomId}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={t("gameRoom.copyRoomCode")}
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="w-full py-3 px-4 bg-red-500/10 cursor-pointer hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all group"
          >
            <X size={18} className="group-hover:scale-110 transition-transform" />
            <span>{t("gameRoom.cancelSearch")}</span>
          </button>

        </div>
      </div>
    </>
  );
};