import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  nationality: string;
  club: string;
  league: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  height: number;
  age: number;
  imageUrl: string;
  isLegend: boolean;
}

const PlayerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    nationality: { type: String, required: true },
    club: { type: String, required: true },
    league: { type: String },
    position: {
      type: String,
      required: true,
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    },
    height: { type: Number },
    age: { type: Number },
    imageUrl: { type: String },
    isLegend: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
