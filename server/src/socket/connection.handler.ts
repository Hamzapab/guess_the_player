import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import Game from '../models/Game.js';

export const registerConnectionHandlers = (
  io: Server,
  socket: Socket,
  currentUserId: string,
  activeUsers: Map<string, number>,
  matchmakingQueue : { socket: Socket; userId: string }[],
  clearRoomTimer: (roomId: string) => void
) => {
  const user = socket.data.user;

  socket.on('disconnect', async () => {
    console.log(`User ${user?.userId} disconnected`);
    const roomId = socket.data.roomId;

    //  user disconnect  -> remove it from queue
    matchmakingQueue = matchmakingQueue.filter(p => p.userId !== user?.userId);

    if (!roomId) return; // User wasn't in a room

    // Notify the other player that their opponent disconnected
    socket.to(roomId).emit('opponent_disconnected', {
      message: 'Opponent lost connection. Waiting 30 seconds for them to return...',
    });

    // Start a 30-second grace period
    setTimeout(async () => {
      try {
        const game = await Game.findOne({ roomId });

        // If game doesn't exist or is already finished, do nothing
        if (!game || game.status === 'finished' || game.players.length < 2) return;

        // Check if the disconnected user is STILL missing from the Socket.io room
        // io.in(roomId).fetchSockets() is a Socket.IO method that lets you get all the socket connections currently in a specific room
        // Returns an array of socket objects
        const connectedSockets = await io.in(roomId).fetchSockets();

        const isUserBack = connectedSockets.some(s => (s as any).user?.userId === user?.userId);

        if (!isUserBack) {
          console.log(`User ${user?.userId} failed to reconnect. Forfeiting game.`);

          // Figure out who the winner is (the person who DIDN'T disconnect)
          const disconnectedPlayerId = user?.userId;
          const winnerId = game.players.find(id => id !== disconnectedPlayerId);

          // End the game
          game.status = 'finished';
          game.winner = winnerId;

          game.history.push({
            id: randomUUID(),
            action: 'forfeit',
            playerId: disconnectedPlayerId,
            timestamp: new Date(),
            details: { reason: 'abandonment' }
          });

          await game.save();

          // Tell the player who stayed online that they won!
          io.to(roomId).emit('game_over', {
            winnerId: winnerId,
            reason: 'opponent_abandoned',
            lives: Object.fromEntries(game.remainingGuesses),
            history: game.history
          });
        } else {
          // User reconnected in time! Tell the opponent.
          io.to(roomId).emit('opponent_reconnected', {
            message: 'Opponent has reconnected! The game continues.',
          });
        }

      } catch (error) {
        console.error('Error handling disconnect timeout:', error);
      }
    }, 30000); // 30 seconds

    // Remove user from active tracking safely
    if (currentUserId) {
      const currentSessions = activeUsers.get(currentUserId) || 0;
      if (currentSessions <= 1) {
        activeUsers.delete(currentUserId); // Last tab closed
      } else {
        activeUsers.set(currentUserId, currentSessions - 1); // Just closed one of multiple tabs
      }
      
      // Broadcast the updated count
      io.emit('online_count_update', { count: activeUsers.size });
    }

    // Clear timing
    clearRoomTimer(roomId);
  });
};