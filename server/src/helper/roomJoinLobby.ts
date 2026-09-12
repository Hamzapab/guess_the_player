import { Server } from 'socket.io';
import Game from '../models/Game.js';


const roomWaitTimers = new Map<string, NodeJS.Timeout>();

const ROOM_JOIN_TIMEOUT_MS = 4000;

export  function clearRoomWaitTimer(roomId: string) {
  const existing = roomWaitTimers.get(roomId);
  if (existing) {
    clearTimeout(existing);
    roomWaitTimers.delete(roomId);
  }
}

export default function scheduleRoomWaitTimeout(roomId: string, io: Server) {
 
  if (roomWaitTimers.has(roomId)) return;

  const timer = setTimeout(async () => {
    roomWaitTimers.delete(roomId); 
    try {
      // Re-fetch 
      const freshGame = await Game.findOne({ roomId });

      if (freshGame && freshGame.players.length < 2 && freshGame.status !== 'active') {
        io.to(roomId).emit('room_timeout', {
          roomId,
          message: 'No opponent joined in time. Room closed.',
        });
        await Game.deleteOne({ roomId });
        console.log(`Room ${roomId} deleted after join timeout.`);
      }
    } catch (error) {
      console.error(`Error handling join timeout for room ${roomId}:`, error);
    }
  }, ROOM_JOIN_TIMEOUT_MS);

  roomWaitTimers.set(roomId, timer);
}