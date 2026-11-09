
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Player from '../models/Player.js';
import { normalize } from '../utils/search.js';
import { players } from './playersList.js';
import images from './player-images.json' with { type: 'json' };



dotenv.config();


const playersWithImages = players.map((p) => ({
  ...p,
  imageUrl: images[p.name as keyof typeof images]?.url ?? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTklETLgki8IJ12F5O_jXLLl856phsbUtgqBiC0-y3gpw&s=10',
}));

const playersWithSearch = playersWithImages.map(player => ({
  ...player,
  searchName: normalize(player.name)
}));





const importData = async () => {
  try {
    await connectDB();

    console.log(playersWithSearch.length)
    await Player.deleteMany({});
    console.log('Data Destroyed...');

    await Player.insertMany(playersWithSearch);
    console.log('Data Imported!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
