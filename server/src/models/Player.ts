import mongoose, { Schema, Document } from 'mongoose';
import { normalize } from '../utils/search.js';

export interface IPlayer extends Document {
  name: string;
  searchName?: string;  
  nationality: string;
  club: string;
  league: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  height: number;
  age: number;
  shirtNum : number;
  imageUrl: string;
  isLegend: boolean;
}

const PlayerSchema: Schema = new Schema<IPlayer>(
  {
    name: { type: String, required: true},
    searchName: { type: String, index: true, select: false },
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

PlayerSchema.pre('validate', function (next) {
  if (this.isModified('name') && typeof this.name === 'string') {
    this.name = normalize(this.name);
  }
});

const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export default Player;
