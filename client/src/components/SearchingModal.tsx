import React from 'react';
import {  X, Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchingModalProps {
  onCancel: () => void;
}

export const SearchingModal: React.FC<SearchingModalProps> = ({ onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
   
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-8">
         
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          
          {/* Inner globe icon */}
          <div className="relative w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner z-10">
            <Globe2 size={28} className="animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white uppercase italic tracking-wide mb-2">
          {t("home.searching") || "Searching for open game..."}
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Looking for an available opponent near your skill level.
        </p>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-3.5 cursor-pointer px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all group"
        >
          <X size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          <span>{t("home.cancel") || "Cancel Search"}</span>
        </button>
      </div>
    </div>
  );
};