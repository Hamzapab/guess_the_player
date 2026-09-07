import { create } from 'zustand';


export interface HistoryItem {
  action: 'question' | 'answer' | 'final_guess' | "surrender";
  playerId: string;
  timestamp: Date;
  details: {
    text?: string;          
    answer?: 'pending' | 'yes' | 'no';
    guessedPlayerId?: string; 
    guessedPlayer: string; 
  };
}

interface GameState {
  roomId: string | null;
  status: 'waiting' | 'active' | 'finished' | null;
  currentTurn: string | null;
  myTargetCard: any | null; 
  history: HistoryItem[];
  lives: Record<string, number>; 
  winnerId: string | null;
  isOpponentDisconnected: boolean,
  
  // Actions to update the state
  setRoomState: (data: Partial<GameState>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  status: null,
  currentTurn: null,
  myTargetCard: null,
  history: [],
  lives: {},
  winnerId: null,
  isOpponentDisconnected: false,

  setRoomState: (data) => set((state) => ({ ...state, ...data })),
  
  resetGame: () => set({
    roomId: null,
    status: null,
    currentTurn: null,
    myTargetCard: null,
    history: [],
    lives: {},
    winnerId: null,
  }),
}));