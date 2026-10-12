// utils/countRounds.ts
import { Types } from 'mongoose';

interface HistoryItem {
  action: string;         
  playerId?: string;
  details?: any;
}

export const countQuestionsUsed = (history: HistoryItem[]): number => {
  return history.filter(
    (h) => h.action === 'question' || h.action === 'final_guess'
  ).length;
};