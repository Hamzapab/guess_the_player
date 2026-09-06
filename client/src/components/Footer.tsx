import { useNavigate } from 'react-router-dom';
import { Circle, X, HelpCircle, AlertTriangle } from 'lucide-react';

export const Footer = () => {
   const navigate = useNavigate();
  


  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 mt-auto shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left section: Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic uppercase tracking-wider">
              PitchGuess FC
            </span>
            <p className="text-xs text-slate-500 mt-1">
              © {new Date().getFullYear()} All rights reserved. Not affiliated with FIFA.
            </p>
          </div>

          {/* Middle section: Quick Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <button className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-400 transition-colors"
            onClick={() => navigate("/how-to-play")}
            >
              <HelpCircle size={16} />
              <span>How to Play</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <AlertTriangle size={16} />
              <span>Report Bug</span>
            </button>
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <X size={18} />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <Circle size={18} />
            </a>
          </div>

  

        </div>
      </div>
    </footer>
  );
};