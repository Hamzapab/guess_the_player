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

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.userId}`);

    socket.onAny((eventName, ...args) => {
      console.log(`[DEBUG] Event received: ${eventName}`, args);
    });

    registerRoomHandlers(io, socket, startTurnTimer);
    registerGameHandlers(io, socket, startTurnTimer, clearRoomTimer);
    registerConnectionHandlers(io, socket, clearRoomTimer);
  });

  return io;
};