import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const TargetCard: React.FC = () => {
  const myTargetCard = useGameStore((state) => state.myTargetCard);

  if (!myTargetCard) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-500 animate-pulse">
        Loading your secret identity...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-xl text-center relative overflow-hidden">
      <span className="absolute top-2 right-2 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20">
        SECRET
      </span>

      <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Your Identity</p>
      <div className="w-20 h-20 bg-amber-500 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg border-2 border-slate-950">
        🏃‍♂️
      </div>
      
      <h3 className="text-xl font-black text-white">{myTargetCard.name}</h3>
      <p className="text-xs text-yellow-500 font-bold uppercase tracking-wide">{myTargetCard.position}</p>

      <div className="mt-4 space-y-1.5 border-t border-slate-800 pt-3 text-left text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Club:</span>
          <span className="text-white font-medium">{myTargetCard.club}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">League:</span>
          <span className="text-white font-medium">{myTargetCard.league}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Nation:</span>
          <span className="text-white font-medium">{myTargetCard.nationality}</span>
        </div>
      </div>
    </div>
  );
};