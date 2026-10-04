import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createTurnTimer } from './socket/TurnTimer.js';
import { registerAuthMiddleware } from './socket/auth.middleware.js';
import { registerRoomHandlers } from './socket/Room.handler.js';
import { registerGameHandlers } from './socket/Game.handler.js';
import { registerConnectionHandlers } from './socket/Connection.handler.js';

declare module 'socket.io' {
  interface SocketData {
    user: { userId: string };
    roomId?: string;
  }
}

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
    registerConnectionHandlers(io, socket, currentUserId, activeUsers,clearRoomTimer);
  });

  return io;
};