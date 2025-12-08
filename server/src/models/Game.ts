import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  roomId: string;
  players: mongoose.Types.ObjectId[];
  targetPlayers: Map<string, string>; // UserID -> PlayerID (card held)
  currentTurn: mongoose.Types.ObjectId;
  status: 'waiting' | 'active' | 'finished';
  winner?: mongoose.Types.ObjectId;
  language: 'en' | 'fr' | 'ar';
  history: Array<{
    action: string;
    playerId: mongoose.Types.ObjectId;
    timestamp: Date;
    details?: any;
  }>;
  createdAt: Date;
}

const GameSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  targetPlayers: { type: Map, of: String },
  currentTurn: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'finished'], 
    default: 'waiting' 
  },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  language: { 
    type: String, 
    enum: ['en', 'fr', 'ar'], 
    default: 'en' 
  },
  history: [{
    action: String,
    playerId: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: Schema.Types.Mixed
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGame>('Game', GameSchema);
