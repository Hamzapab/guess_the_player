import { redis } from '../config/redis.js';
import { LeaderboardStats } from '../models/LeaderboardStats.js';

interface UpdateStatsParams {
  userId: string;
  username: string;
  avatar?: string;
  seasonId: string; 
  pointsEarned: number;
  won: boolean;
}

export const updateUserStats = async ({
  userId,
  username,
  avatar = '',
  seasonId,
  pointsEarned,
  won,
}: UpdateStatsParams) => {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // "2026-10-11"
  const currentMonth = currentDate.substring(0, 7);     // "2026-10"

  const winIncrement = won ? 1 : 0;
  const lossIncrement = won ? 0 : 1;


  // Update Redis
  const pipeline = redis.pipeline();

  pipeline.zincrby(`lb:${seasonId}:all`, pointsEarned, userId);
  pipeline.zincrby(`lb:${seasonId}:monthly:${currentMonth}`, pointsEarned, userId);
  pipeline.zincrby(`lb:${seasonId}:daily:${currentDate}`, pointsEarned, userId);
  pipeline.zincrby(`lb:global:all`, pointsEarned, userId);

  await pipeline.exec();

  // Update the DB

  // Update Active Season 
  // Mongoose recall => " Model.findOneAndUpdate(filter, update, options) "
  await LeaderboardStats.findOneAndUpdate(
    { userId: userId, seasonId: seasonId },
    {
      $inc: { 
        'stats.points': pointsEarned,
        'stats.wins': winIncrement,
        'stats.losses': lossIncrement,
        'stats.matchesPlayed': 1,
        'monthly.points': pointsEarned,
        'monthly.wins': winIncrement,
        'monthly.losses': lossIncrement,
        'daily.points': pointsEarned,
        'daily.wins': winIncrement,
        'daily.losses': lossIncrement,       
      },
      $set: {
        'monthly.currentMonth': currentMonth,
        'daily.currentDate': currentDate,
        username,
        avatar,
      }
    },
    { upsert: true, new: true }
  );

  // B. Update Global Lifetime Record (Tracks cumulative cross-season stats only)
  await LeaderboardStats.findOneAndUpdate(
    { userId, seasonId: 'global' },
    {
      $inc: {
        'stats.points': pointsEarned,
        'stats.wins': winIncrement,
        'stats.losses': lossIncrement,
        'stats.matchesPlayed': 1,
      },
      $set: {
        username,
        avatar,
      }
    },
    { upsert: true, new: true }
  );
};