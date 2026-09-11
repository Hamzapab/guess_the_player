import { useGameStore } from '../store/useGameStore';
import { useUser } from '@clerk/clerk-react';
import { HelpCircle } from 'lucide-react';


export const OpponentCard = () => {
  // const history = useGameStore((state) => state.history);
  const players = useGameStore((state) => state.players);
  const isOpponentOff = useGameStore((state) => state.isOpponentDisconnected);

  // Grab the local user's ID to check who OP
  const { user } = useUser();
  const localUserId = user?.id;

  const opponent = Object.entries(players).find(([id]) => id !== localUserId)?.[1];
  const opponentImageUrl = opponent?.imageUrl;
  const opponentName = opponent?.username;

  const isActive = !isOpponentOff;

  return (
    <div className="max-w-110 flex-1 flex flex-col items-center bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-xl p-3 pt-5 px-2 shadow-xl text-center relative overflow-hidden">
      <div className="w-full flex items-center justify-between  mb-10">
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

      {/* Player Card */}
      <div className="w-full max-w-85 rounded-2xl overflow-hidden bg-gradient-to-b from-[#3a1620] via-[#241119] to-[#120a10] border border-white/10 shadow-2xl">
        <div className="relative rounded-2xl bg-gray-900/60 border border-gray-800 p-5 overflow-hidden animate-pulse">
          <div className="w-8 h-9 rounded-full bg-gray-800 mb-6" />

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-xl border-2 border-gray-700 flex items-center justify-center">
              <HelpCircle className="w-9 h-9 text-gray-700" strokeWidth={1.5} />
            </div>
          </div>


          <div className="h-4 rounded-full bg-gray-800 mb-2" />
          <div className="h-3 w-2/3 rounded-full bg-gray-800/80 mb-4" />

          {/* divider */}
          <div className="border-t border-gray-800 mb-4" />

          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 rounded-lg bg-gray-800/70" />
            <div className="h-8 rounded-lg bg-gray-800/70" />
            <div className="h-8 rounded-lg bg-gray-800/70" />
          </div>
        </div>
      </div>
      <p className='text-[#94A3B8] text-sm max-w-80 mt-6'>
        Find out who this player is!
      </p>
    </div>
  );
};

