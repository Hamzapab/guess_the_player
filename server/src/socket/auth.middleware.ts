import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';

export const registerAuthMiddleware = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    const rawToken = socket.handshake.auth.token ?? socket.handshake.headers?.token;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // `sub` is the standard JWT subject claim — Clerk sets it to the user's ID
      socket.data.user = { userId: payload.sub };
      next();
    } catch (err) {
      console.error('Socket auth failed:', err);
      next(new Error('Authentication error'));
    }
  });
};