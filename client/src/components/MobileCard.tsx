import { useGameStore } from '../store/useGameStore';
import { useUser } from '@clerk/clerk-react';
import {  Clock } from "lucide-react";
import PlayerCard from './mobilePlayer';

export const MobileCard = () => {
  const myTargetCard = useGameStore((state) => state.myTargetCard);


  const players = useGameStore((state) => state.players);
  const isOpponentOff = useGameStore((state) => state.isOpponentDisconnected);
  const secondsLeft = useGameStore((state) => state.secondsLeft);
  const currentTurn = useGameStore((state) => state.currentTurn);

  // Grab the local user's ID to check who OP
  const { user } = useUser();
  const localUserId = user?.id;

  const isMyTurn = currentTurn === localUserId;

  const opponent = Object.entries(players).find(([id]) => id !== localUserId)?.[1];
  const opponentImageUrl = opponent?.imageUrl;
  const opponentName = opponent?.username;

  const isActive = !isOpponentOff;



  if (!myTargetCard) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-500 animate-pulse">
        Loading your secret identity...
      </div>
    );
  }

  return (
    <div className=" flex flex-1 md:hidden flex-col items-center rounded-xl p-3 pt-5 px-2 shadow-xl text-center relative overflow-hidden">
      
       {/* timer */}
      <div className="flex h-14 w-full container items-center mb-3 justify-between bg-gray-900 text-white rounded-lg px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <div>
            <h3 className="font-bold text-sm">{isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Clock
              className={`w-6 h-6 shrink-0 transition-colors duration-300 ${secondsLeft <= 10 ? "text-red-400 animate-pulse" : "text-green-500"
                }`}
            />
           <span
              className={`text-lg font-semibold tabular-nums w-7 text-right transition-colors duration-300 ${secondsLeft <= 10 ? "text-red-400" : "text-[#92A4C9]"
                }`}
            >
              {secondsLeft}s
            </span>
        </div>
      </div>
      {/* Users */}
      <div className='w-full container flex gap-4 justify-between bg-gray-900 px-4 py-3 mb-3'>
        {/* me */}
        <div className="flex flex-1 items-center justify-between gap-4 pe-2 border-r-2 border-blue-300">
          <div className="relative shrink-0 flex gap-4">
            <div className="w-9 h-9  relative rounded-full flex items-center justify-center text-sm font-semibold text-white ">
              <div className='w-9 h-9 overflow-hidden rounded-full'>
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 z-10 w-3 h-3 rounded-full border-2 border-neutral-900 ${isActive ? "bg-emerald-400" : "bg-neutral-600"
                  }`}
              />
            </div>
            <div className='flex flex-col text-start'>
              <span className="text-white text-sm font-medium">You</span>
              <span
                className={`text-xs ${isActive ? "text-emerald-400" : "text-neutral-500"
                  }`}
              >
                {isActive ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-sm text-xs font-medium inline-block ${isMyTurn
            ? "bg-[rgba(34,197,94,0.1)] text-[#22C55E]"
            : "bg-[rgba(107,114,128,0.1)] text-[#6B7280]"
            }`}>
            {isMyTurn ? "Turn Active" : "Opponent's turn"}
          </div>
        </div>
        {/* op */}
        <div className="flex flex-1 items-center justify-between  pe-2">
          <div className="relative shrink-0 flex gap-4">
            <div className="w-9 h-9  relative rounded-full flex items-center justify-center text-sm font-semibold text-white ">
              <div className='w-9 h-9 overflow-hidden rounded-full'>
                <img
                  src={opponentImageUrl}
                  alt="Opponent Profile"
                />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 z-10 w-3 h-3 rounded-full border-2 border-neutral-900 ${isActive ? "bg-emerald-400" : "bg-neutral-600"
                  }`}
              />
            </div>

            <div className='flex flex-col text-start'>
              <span className="text-white text-sm font-medium">{opponentName}</span>
              <span
                className={`text-xs ${isActive ? "text-emerald-400" : "text-neutral-500"
                  }`}
              >
                {isActive ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-sm text-xs font-medium inline-block`}>

          </div>
        </div>
      </div>
    
      {/* Player Card */}
      <PlayerCard myTargetCard={myTargetCard} />
    </div>
  );
};




