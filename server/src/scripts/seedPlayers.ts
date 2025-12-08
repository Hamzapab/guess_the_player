import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Player from '../models/Player.js';

dotenv.config();

const players = [
  {
    name: 'Lionel Messi',
    nationality: 'Argentina',
    club: 'Inter Miami',
    league: 'MLS',
    position: 'Forward',
    height: 170,
    age: 36,
    imageUrl: 'https://example.com/messi.jpg',
    isLegend: true,
  },
  {
    name: 'Cristiano Ronaldo',
    nationality: 'Portugal',
    club: 'Al Nassr',
    league: 'Saudi Pro League',
    position: 'Forward',
    height: 187,
    age: 39,
    imageUrl: 'https://example.com/ronaldo.jpg',
    isLegend: true,
  },
  {
    name: 'Erling Haaland',
    nationality: 'Norway',
    club: 'Manchester City',
    league: 'Premier League',
    position: 'Forward',
    height: 195,
    age: 23,
    imageUrl: 'https://example.com/haaland.jpg',
    isLegend: false,
  },
  {
    name: 'Kylian Mbappé',
    nationality: 'France',
    club: 'Real Madrid',
    league: 'La Liga',
    position: 'Forward',
    height: 178,
    age: 25,
    imageUrl: 'https://example.com/mbappe.jpg',
    isLegend: false,
  },
  {
    name: 'Kevin De Bruyne',
    nationality: 'Belgium',
    club: 'Manchester City',
    league: 'Premier League',
    position: 'Midfielder',
    height: 181,
    age: 32,
    imageUrl: 'https://example.com/kdb.jpg',
    isLegend: false,
  },
];

const importData = async () => {
  try {
    await connectDB();

    await Player.deleteMany({});
    console.log('Data Destroyed...');

    await Player.insertMany(players);
    console.log('Data Imported!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
