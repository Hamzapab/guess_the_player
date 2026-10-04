import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import Game from '../models/Game.js';

export const createTurnTimer = (io: Server) => {
  const roomTimers = new Map<string, NodeJS.Timeout>();

  const clearRoomTimer = (roomId: string) => {
    const existing = roomTimers.get(roomId);
    if (existing) clearTimeout(existing);
    roomTimers.delete(roomId);
  };

  const startTurnTimer = (roomId: string) => {
    clearRoomTimer(roomId); // clear timing stack 

    const timer = setTimeout(async () => {
      try {
        const game = await Game.findOne({ roomId });
        if (!game || game.status !== 'active') return; // no active game -> exit

        const timedOutPlayer = game.currentTurn;
        const player1Id = game.players[0];
        const player2Id = game.players[1];
        const nextTurn = timedOutPlayer === player1Id ? player2Id : player1Id;

        game.history.push({
          id: randomUUID(),
          action: 'question_timed',
          playerId: timedOutPlayer,
          timestamp: new Date(),
          details: { text: null, answer: 'timed_out' }
        });

        game.currentTurn = nextTurn;
        await game.save();

        io.to(roomId).emit('turn_resolved', {
          history: game.history,
          lives: Object.fromEntries(game.remainingGuesses),
          newTurn: game.currentTurn,
          systemMessage: 'Player took too long to ask. Turn passed to opponent.'
        });

        startTurnTimer(roomId); // OP turn — restart the clock
      } catch (error) {
        console.error('Error handling turn timeout:', error);
      }
    }, 40000);

    roomTimers.set(roomId, timer);
  };

  return { startTurnTimer, clearRoomTimer };
};