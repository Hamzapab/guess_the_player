import { useGameStore } from '../store/useGameStore';
import { useSocketStore } from '../store/socketStore';
import { useUser } from '@clerk/clerk-react';
import { User, Shield, Trophy, Clock } from "lucide-react";

export const TargetCard = () => {
  const myTargetCard = useGameStore((state) => state.myTargetCard);
  const secondsLeft = useGameStore((state) => state.secondsLeft);
  const isAskingPhase = useGameStore((state) => state.isAskingPhase);


  // Grab the local user's ID to check if it's their turn
  const { user } = useUser();
  const localUserId = user?.id;

  const currentTurn = useGameStore((state) => state.currentTurn);

  const isMyTurn = currentTurn === localUserId;

  const { isConnected } = useSocketStore();

  const isActive = isConnected;

  // TO DO : Add Player Image
  const imageUrl = "";

  if (!myTargetCard) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-500 animate-pulse">
        Loading your secret identity...
      </div>
    );
  }

  return (
    <div className=" hidden max-w-110 flex-1 md:flex flex-col items-center bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-xl p-3 pt-5 px-2 shadow-xl text-center relative overflow-hidden">
      <div className="w-full flex items-center justify-between  mb-1">
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

      {/* timer */}
      <div className='h-10'>
        {(isAskingPhase && isMyTurn) && (
          <div className="h-10 flex items-center gap-2">
            <Clock
              className={`w-5 h-5 shrink-0 transition-colors duration-300 ${secondsLeft <= 10 ? "text-red-400 animate-pulse" : "text-green-500"
                }`}
            />

            <div className="relative flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full text-sm rounded-full transition-all duration-1000 ease-linear ${secondsLeft <= 10
                  ? "bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                  : "bg-gradient-to-r from-blue-600 to-blue-400"
                  }`}
                style={{ width: `${(secondsLeft / 40) * 100}%` }}
              />
            </div>

            <span
              className={`text-xs font-semibold tabular-nums w-7 text-right transition-colors duration-300 ${secondsLeft <= 10 ? "text-red-400" : "text-[#92A4C9]"
                }`}
            >
              {secondsLeft}s
            </span>
          </div>
        )}
      </div>
      {/* Player Card */}
      <div className="w-full max-w-85 rounded-2xl overflow-hidden bg-gradient-to-b from-[#3a1620] via-[#241119] to-[#120a10] border border-white/10 shadow-2xl">

        <div className="mt-2 h-56 flex items-end justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={myTargetCard.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <User className="w-28 h-28 text-white/15" strokeWidth={1} />
          )}
        </div>
        <div className="px-4 pt-2">
          <h2 className="text-white text-xl font-bold leading-tight mb-2">{myTargetCard.name}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-white/60 text-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>
              {myTargetCard.club} &middot; {myTargetCard.nationality}
            </span>
          </div>
          <div className="text-white/60  text-xs text-start flex mt-1">
            <Trophy className="w-3.5 h-3.5 me-2" />
            <span> League: {myTargetCard.league}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-4 mt-2">
          <Stat label="POS" value={myTargetCard.position} />
          <Stat label="AGE" value={myTargetCard.age} />
          <Stat label="NO." value={myTargetCard.shirtNum} />
        </div>
      </div>
      <p className='text-[#94A3B8] text-sm max-w-80 mt-4'>
        Your opponent is trying to guess this player. Keep your answers accurate!
      </p>
    </div>
  );
};





function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div >
      <div className="text-white/40 text-[10px] font-medium tracking-wide">
        {label}
      </div>
      <div className="text-white text-xs font-bold mt-1">{value}</div>
    </div>
  );
}