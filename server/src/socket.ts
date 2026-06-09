import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Game from './models/Game.js';

interface AuthTokenPayload {
  userId: string;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middlware to handle Auth
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers?.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
      // Attach user data to the socket object if needed, or just verify
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user?.userId || 'Unknown'}`);

    socket.on('join_room', async ({ roomId }: { roomId: string }) => {
      try {
        const game = await Game.findOne({ roomId });

        if (!game) {
          socket.emit('error', { message: 'Game room not found' });
          return;
        }

        // 2. The Lock: Check if the game is already finished
        if (game.status === 'finished') {
          socket.emit('error', { message: 'This match has already ended.' });
          return;
        }

        const currentUserId = user?.userId;
        const isAlreadyInRoom = game.players.includes(currentUserId);

        // 3. If this is a NEW player trying to join
        if (!isAlreadyInRoom) {
          // Check if the room is already full
          if (game.players.length >= 2 || game.status === 'active') {
            socket.emit('error', { message: 'This game room is full.' });
            return;
          }

          // Add them to the database array
          game.players.push(currentUserId);
          await game.save();
        }

        // 4. Join the Socket.io room (Safe for both new joins and page refreshes)
        socket.join(roomId);

        // Send current players list to the client who just joined
        socket.emit('room_joined', {
          roomId,
          players: game.players,
          message: `Successfully joined room ${roomId}`
        });

        // Notify the other player in the room
        socket.to(roomId).emit('user_joined', {
          userId: currentUserId
        });

        console.log(`User ${currentUserId} joined room: ${roomId}`);
        console.log(`Players in DB for room: ${game.players.length}`);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
