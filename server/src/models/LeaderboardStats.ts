import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboardStats extends Document {
  userId: string;
  seasonId: string;   // season id or global
  username: string;
  avatar: string;
  
  stats: {
    points: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
  };

  // Optional for lifetime records
  monthly?: {
    currentMonth: string; 
    points: number;
    wins: number;
    losses: number;
  };

  daily?: {
    currentDate: string;  
    points: number;
    wins: number;
    losses: number;
  };
}

const LeaderboardStatsSchema = new Schema<ILeaderboardStats>({
  userId: { type: String, required: true, index: true },
  seasonId: { type: String, required: true, index: true }, 
  username: { type: String, required: true },
  avatar: { type: String, default: '' },

  stats: {
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
  },

  monthly: {
    currentMonth: { type: String, default: '' },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },

  daily: {
    currentDate: { type: String, default: '' },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Compound indexes for fast sorting
LeaderboardStatsSchema.index({ seasonId: 1, 'stats.points': -1 });
LeaderboardStatsSchema.index({ seasonId: 1, 'monthly.currentMonth': 1, 'monthly.points': -1 });
LeaderboardStatsSchema.index({ seasonId: 1, 'daily.currentDate': 1, 'daily.points': -1 });
LeaderboardStatsSchema.index({ userId: 1, seasonId: 1 }, { unique: true });

export const LeaderboardStats = mongoose.model<ILeaderboardStats>('LeaderboardStats', LeaderboardStatsSchema);