import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import { Server as HttpServer } from 'http';
import { createTurnTimer } from './socket/turnTimer.js';
import { registerAuthMiddleware } from './socket/auth.middleware.js';
import { registerRoomHandlers } from './socket/room.handler.js';
import { registerGameHandlers } from './socket/game.handler.js';
import { registerConnectionHandlers } from './socket/connection.handler.js';
import { attemptMatchmaking } from './helper/matchMaking.js';
import { matchMakingHandler } from './socket/matchmaking.handler.js';

declare module 'socket.io' {
  interface SocketData {
    user: { userId: string };
    roomId?: string;
  }
}


// the global matchmaking queue (outside the connection listener)

let matchmakingQueue: { socket: Socket; userId: string }[] = [];

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const { startTurnTimer, clearRoomTimer } = createTurnTimer(io);

  // Middleware to handle Auth
  registerAuthMiddleware(io);


  // Actives Users
  const activeUsers = new Map<string, number>();

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    const currentUserId = user?.userId;
    console.log(`User connected: ${currentUserId}`);

    if (currentUserId) {
      const currentSessions = activeUsers.get(currentUserId) || 0;
      activeUsers.set(currentUserId, currentSessions + 1);
      
      // Broadcast the new unique user count to everyone
      io.emit('online_count_update', { count: activeUsers.size });
    }

    socket.onAny((eventName, ...args) => {
      console.log(`[DEBUG] Event received: ${eventName}`, args);
    });

    registerRoomHandlers(io, socket, startTurnTimer);
    registerGameHandlers(io, socket, startTurnTimer, clearRoomTimer);
    matchMakingHandler(io, socket, matchmakingQueue, attemptMatchmaking)
    registerConnectionHandlers(io, socket, currentUserId, activeUsers, matchmakingQueue , clearRoomTimer );
  });

  return io;
};