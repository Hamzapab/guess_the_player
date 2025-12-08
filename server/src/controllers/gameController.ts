import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Game from '../models/Game.js';

// Helper to generate a random 6-character room ID
const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { language = 'en' } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    let roomId = generateRoomId();
    let existingGame = await Game.findOne({ roomId });

    // Ensure uniqueness
    while (existingGame) {
      roomId = generateRoomId();
      existingGame = await Game.findOne({ roomId });
    }

    const newGame = new Game({
      roomId,
      players: [userId],
      language,
      status: 'waiting',
      history: []
    });

    await newGame.save();

    res.status(201).json({
      message: 'Game created successfully',
      gameId: newGame._id,
      roomId: newGame.roomId,
      game: newGame
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error while creating game' });
  }
};
