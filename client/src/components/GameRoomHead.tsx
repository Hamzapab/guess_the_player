import { LogOut } from 'lucide-react';
import logo from "../assets/logo.png";
import { useTranslation } from 'react-i18next';
import { useSocketStore } from '../store/socketStore';
import { useGameStore } from '../store/useGameStore';
import { useNavigate } from 'react-router-dom';




export const GameRoomHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roomId = useGameStore((state) => state.roomId);
  const socket = useSocketStore((state) => state.socket);

  const handleCancel = () => {
    if (socket) {
       socket.emit('quit_game', { roomId });
      navigate("/")
    }
  };

  return (
    <header className="w-full bg-[#080d1a] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between text-white select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
             <img src={logo} alt="logo" />
          </div>

          <div>
            <h1 className="text-base font-bold text-white leading-tight tracking-wide">
              {t("header.title")}
            </h1>
    
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-[1px] bg-slate-800 mx-1" />+
      </div>

      <button
        onClick={handleCancel}
        className="flex items-center gap-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/40 group"
      >
        <LogOut size={18} className="text-slate-400 group-hover:text-white transition-colors" />
        <span>Quit Game</span>
      </button>
    </header>
  );
};