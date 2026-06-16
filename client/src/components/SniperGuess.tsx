import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/authStore';
import { submitFinalGuess } from '../store/gameActions';


interface Footballer {
  _id: string;
  name: string;
  club: string;
}

export const SniperGuess: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Footballer | null>(null);
  const dropdownRef = useRef<HTMLFormElement | null>(null);

  const currentTurn = useGameStore((state) => state.currentTurn);
  const localUserId = useAuthStore((state) => state.user?.userId);
  const isMyTurn = currentTurn === localUserId;

  // TODO: Replace with players from DB
  const mockAllPlayersList: Footballer[] = [
    { _id: '1', name: 'Lionel Messi', club: 'Inter Miami' },
    { _id: '2', name: 'Cristiano Ronaldo', club: 'Al Nassr' },
    { _id: '3', name: 'Kylian Mbappé', club: 'Real Madrid' },
    { _id: '4', name: 'Erling Haaland', club: 'Manchester City' },
  ];

  const filteredPlayers = searchTerm.trim() === ''
    ? []
    : mockAllPlayersList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelect = (player: Footballer) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
    setIsOpen(false);
  };

  const handleFireGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    if (window.confirm(`Are you absolutely sure it's ${selectedPlayer.name}? Incorrect guess will cost 1 life!`)) {
      submitFinalGuess(selectedPlayer._id);
      setSearchTerm('');
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="bg-gray-950 border border-red-900/30 rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <h3 className="font-bold text-sm text-gray-300 tracking-wider">SNIPER FINAL GUESS (BOX 2)</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Think you know who they are playing as? Search the master listing and lock it in.
      </p>

      {isMyTurn ? (
        <form onSubmit={handleFireGuess} className="space-y-3" ref={dropdownRef}>
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
            {isOpen && filteredPlayers.length > 0 && (
              <ul className="absolute z-50 w-full bg-gray-900 border border-gray-700 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-2xl">
                {filteredPlayers.map((player) => (
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
        <div className="bg-gray-900 text-center text-gray-500 text-xs py-3 rounded-lg border border-gray-800 italic">
          🔒 Locked until your attack turn.
        </div>
      )}
    </div>
  );
};