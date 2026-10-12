import { calculatePointsEarned } from "../utils/calculatePointsEarned.js";
import { updateUserStats } from '../services/leaderboardService.js';

export const handleMatchCompletion = async (
  roomId: string, 
  winnerUserId: string, 
  loserUserId: string, 
  totalQuestionsUsed: number,
  winnerData: { username: string; avatar?: string },
  loserData: { username: string; avatar?: string }
) => {
  try {

    // TO-DO : change later with env variable
    const activeSeason = "Season_1";
    // calculate points
    const winnerPoints = calculatePointsEarned(totalQuestionsUsed, true);
    const loserPoints = calculatePointsEarned(totalQuestionsUsed, false); 

    // 1. Update Winner Stats
    await updateUserStats({
      userId: winnerUserId,
      username: winnerData.username,
      avatar: winnerData.avatar || '',
      seasonId: activeSeason,
      pointsEarned: winnerPoints,
      won: true,
    });

    // 2. Update Loser Stats
    await updateUserStats({
      userId: loserUserId,
      username: loserData.username,
      avatar: loserData.avatar || '',
      seasonId: activeSeason,
      pointsEarned: loserPoints,
      won: false,
    });

    console.log(`Match ${roomId} completed in ${totalQuestionsUsed} questions. Winner earned ${winnerPoints} pts.`);
  } catch (error) {
    console.error('Error updating leaderboard on match completion:', error);
  }
};