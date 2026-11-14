import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useUser } from "@clerk/clerk-react";
import { Heart, Lock , Target} from 'lucide-react';
import { submitFinalGuess } from '../store/gameActions';
import { usePlayerSearch } from '../hooks/usePlayerSearch';


export interface Player {
  _id: string;
  name: string;
  nationality: string;
  club: string;
  league?: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  height?: number;
  age?: number;
  imageUrl?: string;
  isLegend: boolean;
  createdAt: string; 
  updatedAt: string;
}


export const SniperGuess: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const history = useGameStore((state) => state.history);
  const lives = useGameStore((state) => state.lives);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const dropdownRef = useRef<HTMLFormElement | null>(null);


  console.log(lives)
  
  const currentTurn = useGameStore((state) => state.currentTurn);

  const lastHistoryItem = history[history.length - 1];
  const isPending = lastHistoryItem?.details.answer === 'pending';

  const { user } = useUser();
  const localUserId = user?.id;

 const myLives = localUserId ? (lives[localUserId] ?? 3) : 3;
  
  const isMyTurn = currentTurn === localUserId;

  // Skip searching when the input just mirrors the selected player's name
  const shouldSearch = isMyTurn && selectedPlayer?.name !== searchTerm;
  const { players } = usePlayerSearch(searchTerm, shouldSearch);
  

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelect = (player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
    setIsOpen(false);
  };

  const handleFireGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    if (window.confirm(`Are you absolutely sure it's ${selectedPlayer.name}? Incorrect guess will cost 1 life!`)) {
      submitFinalGuess(selectedPlayer._id,selectedPlayer.name);
      setSearchTerm('');
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="bg-gray-950 border border-red-900/30 rounded-xl p-5 py-4">
      <div className="w-full flex justify-between items-center gap-2 mb-2">
        <div  className="flex items-center gap-2">
          <span className="text-lg">
            <Target className="w-3 h-3 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
          </span>
          <h3 className="font-bold text-sm text-gray-300 tracking-wider">SNIPER FINAL GUESS</h3>
        </div>
        <div className="flex gap-1 items-center " role="img" aria-label={`${myLives} Remaining Lives`}>
  {Array.from({ length: 3 }, (_, i) => (
    <Heart
      key={i}
      size={15}
      className={i < myLives ? "text-rose-500 fill-rose-500" : "text-slate-600"}
    />
  ))}
</div>
      </div>
      <p className="text-xs text-gray-400 mb-2">
        Think you know who they are playing as? Search the master listing and lock it in.
      </p>

      {(isMyTurn && !isPending) ? (
        <form onSubmit={handleFireGuess} className="space-y-2" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                if (selectedPlayer && e.target.value !== selectedPlayer.name) {
                  setSelectedPlayer(null);
                }
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Type player name..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500"
            />

            {/* Autocomplete Dropdown Options */}
            {isOpen && players.length > 0 && (
              <ul className="absolute z-50 w-full bg-gray-900 border border-gray-700 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-2xl">
                {players.map((player) => (
                  <li
                    key={player._id}
                    onClick={() => handleSelect(player)}
                    className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm flex justify-between"
                  >
                    <span className="text-white font-medium">{player.name}</span>
                    <span className="text-gray-500 text-xs">{player.club}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedPlayer}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Fire Final Guess
          </button>
        </form>
      ) : (
        <div className="flex justify-center items-center gap-3
        bg-gray-900 text-center text-gray-500 text-xs py-3 rounded-lg border border-gray-800 italic">
          <Lock className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]"  /> Locked until your attack turn.
        </div>
      )}
    </div>
  );
};