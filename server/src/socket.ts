import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Game from './models/Game.js';
import Player from './models/Player.js';

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

         // Game Engine ###############
          if (game.players.length === 2) {

            // Change Game Status
            game.status = "active"

            // Fetch Players from DB. 

            const randomPlayersCards = await Player.aggregate([
              { $sample: { size: 10 } }
            ]);

            if (randomPlayersCards.length < 2) {
              socket.emit('error', { message: 'Not enough player cards in database to start game.' });
              return;
            }



            // Randomly assign target cards to each player
            const shuffledCards = [...randomPlayersCards].sort(() => 0.5 - Math.random());
            const player1Id = game.players[0].toString();
            const player2Id = game.players[1].toString();

            // Map the player's User ID to their secret assigned Footballer Card ID
            game.targetPlayers = new Map([
              [player1Id, shuffledCards[0]._id.toString()],
              [player2Id, shuffledCards[1]._id.toString()]
            ]);

            // Decide who goes first (50/50 coin flip)
            game.currentTurn = Math.random() < 0.5 ? game.players[0] : game.players[1];

            await game.save();
          } else {
            await game.save();
          }
        
        if (game.status === 'active') {
            io.to(roomId).emit('game_start_signal', {
              roomId,
              currentTurn: game.currentTurn,
              status: game.status
            });
        }

      
        console.log(`User ${currentUserId} joined room: ${roomId}`);
        console.log(`Players in DB for room: ${game.players.length}`);



      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Event for a player to safely discover their own assigned card without exposure
    socket.on('get_my_target_card', async ({ roomId }: { roomId: string }) => {
      try {
        const game = await Game.findOne({ roomId });
        if (!game || !game.targetPlayers) {
          socket.emit('error', { message: 'Game or target cards not found.' });
          return;
        }

        const currentUserId = user?.userId;
        // Look up what footballer ID belongs to this specific user
        const myCardId = game.targetPlayers.get(currentUserId);

        if (!myCardId) {
          socket.emit('error', { message: 'You do not have a card assigned in this match.' });
          return;
        }

        // Fetch the full footballer details from the database
        const cardDetails = await Player.findById(myCardId);

        socket.emit('your_target_card', { targetCard: cardDetails });
      } catch (error) {
        console.error('Error fetching target card:', error);
        socket.emit('error', { message: 'Failed to retrieve your target card.' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
