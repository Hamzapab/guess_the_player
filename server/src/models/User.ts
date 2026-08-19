import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  clerkId: string;
  email?: string;
  password?: string;
  stats: {
    wins: number;
    losses: number;
    totalGames: number;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  clerkId: { type: String, required: true, unique: true },
  email: { type: String},
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
