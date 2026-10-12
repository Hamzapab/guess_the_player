import { Request, Response } from 'express';
import { redis } from '../config/redis.js';
import { LeaderboardStats } from '../models/LeaderboardStats.js';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const seasonId = (req.query.seasonId as string) || 'season_4'; 
    const timeframe = (req.query.timeframe as string) || 'all';   // "daily", "monthly", "all"
    const limit = parseInt(req.query.limit as string) || 20;       // Top N players
    const currentUserId = req.query.userId as string;              // User Rank

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentMonth = currentDate.substring(0, 7);   

    // Build Redis key
    let redisKey = `lb:${seasonId}:all`;
    if (timeframe === 'daily') {
      redisKey = `lb:${seasonId}:daily:${currentDate}`;
    } else if (timeframe === 'monthly') {
      redisKey = `lb:${seasonId}:monthly:${currentMonth}`;
    }

    // Fetch top user 
    const redisResult = await redis.zrevrange(redisKey, 0, limit - 1, 'WITHSCORES');

    let leaderboardData = [];

    // Fetch from Redis
    if (redisResult.length > 0) {

      console.log("HITTT REDIIIIIS");
     
      const userIds: string[] = [];
      const scoreMap: Record<string, number> = {};

      for (let i = 0; i < redisResult.length; i += 2) {
        const uId = redisResult[i];
        const score = parseFloat(redisResult[i + 1]);
        userIds.push(uId);
        scoreMap[uId] = score;
      }

      // Fetch corresponding user profile details (username, avatar, wins/losses) from MongoDB
      const dbStats = await LeaderboardStats.find({
        userId: { $in: userIds },
        seasonId: seasonId === 'global' ? 'global' : seasonId
      });

      const statsMap = new Map(dbStats.map(stat => [stat.userId, stat]));

      // Build the final structured leaderboard list preserving Redis sort order
      leaderboardData = userIds.map((uId, index) => {
        const userDoc = statsMap.get(uId);
        return {
          rank: index + 1,
          userId: uId,
          username: userDoc?.username || 'Unknown Player',
          avatar: userDoc?.avatar || '',
          points: scoreMap[uId] || 0,
          wins: timeframe === 'daily' ? userDoc?.daily?.wins : timeframe === 'monthly' ? userDoc?.monthly?.wins : userDoc?.stats?.wins,
          losses: timeframe === 'daily' ? userDoc?.daily?.losses : timeframe === 'monthly' ? userDoc?.monthly?.losses : userDoc?.stats?.losses,
        };
      });
    } else {
      // Fallback to MongoDB if Redis key is empty/cold
      console.log("MISS REDIIIIIS")
      let queryFilter: any = { seasonId };
      let sortField = 'stats.points';

      if (timeframe === 'daily') {
        queryFilter['daily.currentDate'] = currentDate;
        sortField = 'daily.points';
      } else if (timeframe === 'monthly') {
        queryFilter['monthly.currentMonth'] = currentMonth;
        sortField = 'monthly.points';
      }

      const mongoStats = await LeaderboardStats.find(queryFilter)
        .sort({ [sortField]: -1 })
        .limit(limit);

      leaderboardData = mongoStats.map((doc, index) => ({
        rank: index + 1,
        userId: doc.userId,
        username: doc.username,
        avatar: doc.avatar,
        points: timeframe === 'daily' ? doc.daily?.points : timeframe === 'monthly' ? doc.monthly?.points : doc.stats?.points,
        wins: timeframe === 'daily' ? doc.daily?.wins : timeframe === 'monthly' ? doc.monthly?.wins : doc.stats?.wins,
        losses: timeframe === 'daily' ? doc.daily?.losses : timeframe === 'monthly' ? doc.monthly?.losses : doc.stats?.losses,
      }));
    }

    // Get User personal rank and score
    let userRankInfo = null;
    if (currentUserId) {
      const userRank = await redis.zrevrank(redisKey, currentUserId);
      const userScore = await redis.zscore(redisKey, currentUserId);
      
      if (userRank !== null) {
        userRankInfo = {
          rank: userRank + 1, // Redis is 0-indexed
          points: userScore ? parseFloat(userScore) : 0,
        };
      }
    }

    res.status(200).json({
      success: true,
      seasonId,
      timeframe,
      leaderboard: leaderboardData,
      userRank: userRankInfo,
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching leaderboard' });
  }
};