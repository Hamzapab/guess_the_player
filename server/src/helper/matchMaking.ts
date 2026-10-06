import { Socket } from 'socket.io';
import Game from '../models/Game.js'; 


const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const attemptMatchmaking = async (matchmakingQueue: { socket: Socket; userId: string }[]) => {
  // 2 players! -> pair
  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift(); 
    const player2 = matchmakingQueue.shift(); 
    
    if (player1 && player2) {
      try {
    
        let roomId = generateRoomId();
        let existingGame = await Game.findOne({ roomId });

  
        while (existingGame) {
          roomId = generateRoomId();
          existingGame = await Game.findOne({ roomId });
        }

        // 2. Create the game directly in the database
        // We set player1 as the creator
    
        const newGame = new Game({
          roomId,
          players: [player1.userId],
          language: 'en', 
          status: 'waiting',
          history: []
        });

        await newGame.save();

        console.log(`Match found! Game created in DB. Pairing ${player1.userId} and ${player2.userId} in room ${roomId}`);

        player1.socket.emit('match_found', { roomId });
        player2.socket.emit('match_found', { roomId });

      } catch (error) {
        console.error('Matchmaking DB creation error:', error);
        
        //  DB fails, put them back at the front of the queue
        matchmakingQueue.unshift(player2);
        matchmakingQueue.unshift(player1);
      }
    }
  }
};