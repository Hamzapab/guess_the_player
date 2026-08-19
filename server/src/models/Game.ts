import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  roomId: string;
  players: string[];
  targetPlayers: Map<string, string>; // UserID -> PlayerID (card held)
  currentTurn: string;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  language: 'en' | 'fr' | 'ar';
  history: Array<{
    action: string;
    playerId: string;
    timestamp: Date;
    details?: any;
  }>;
  remainingGuesses: Map<string, number>;
  createdAt: Date;
}

const GameSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: String }],
  targetPlayers: { type: Map, of: String },
  currentTurn: { type: String },
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'finished'], 
    default: 'waiting' 
  },
  winner: { type : String },
  language: { 
    type: String, 
    enum: ['en', 'fr', 'ar'], 
    default: 'en' 
  },
  history: [{
    action: String,
    playerId: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: Schema.Types.Mixed
  }],
  remainingGuesses: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGame>('Game', GameSchema);
