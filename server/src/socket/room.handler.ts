import { Server, Socket } from 'socket.io';
import Game from '../models/Game.js';
import Player from '../models/Player.js';
import User from '../models/User.js';
import scheduleRoomWaitTimeout from '../helper/roomJoinLobby.js';
import { clearRoomWaitTimer } from '../helper/roomJoinLobby.js';

export const registerRoomHandlers = (
  io: Server,
  socket: Socket,
  startTurnTimer: (roomId: string) => void
) => {
  const user = socket.data.user;

  socket.on('join_room', async ({ roomId }: { roomId: string }) => {
    console.log("Join event tirggered")
    console.log("User :" + user?.userId)
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

      // Get OP Id
      const socketsInRoom = await io.in(roomId).fetchSockets();

      const opponentSocket = socketsInRoom.find(
        (s) => (s as any).user?.userId !== currentUserId
      );

      // Send current players list to the client who just joined
      socket.emit('room_joined', {
        roomId,
        players: game.players,
        opponentOnline: !!opponentSocket,
        message: `Successfully joined room ${roomId}`
      });

      // Storing data with Socket.IO speacial object socket.data
      socket.data.roomId = roomId;

      // Notify the other player in the room
      socket.to(roomId).emit('user_joined', {
        userId: currentUserId
      });

      // Game Engine ###############
      if (game.players.length === 1) {
        // First player is in — start the countdown for an opponent to show up.
        scheduleRoomWaitTimeout(roomId, io);
        await game.save();
      } else if (game.players.length === 2) {

        // Opponent joined in time — cancel the pending deletion.
        clearRoomWaitTimer(roomId);

        // Change Game Status
        game.status = "active"

        // Start timing
        startTurnTimer(roomId);


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
        const player1Id = game.players[0];
        const player2Id = game.players[1];

        // Map the player's User ID to their secret assigned Footballer Card ID
        game.targetPlayers = new Map([
          [player1Id, shuffledCards[0]._id.toString()],
          [player2Id, shuffledCards[1]._id.toString()]
        ]);

        // Decide who goes first (50/50 coin flip)
        game.currentTurn = Math.random() < 0.5 ? game.players[0] : game.players[1];

        // resolve both players' public profile info from DB
        const users = await User.find({
          clerkId: { $in: [player1Id, player2Id] },
        }).select('clerkId username imageUrl');

        game.playersInfo = new Map(
          users.map(u => [u.clerkId, { username: u.username, imageUrl: u.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original' }])
        );
        await game.save();
      } else {
        await game.save();
      }

      if (game.status === 'active') {
        io.to(roomId).emit('game_start_signal', {
          roomId,
          currentTurn: game.currentTurn,
          status: game.status,
          lives: Object.fromEntries(game.remainingGuesses),
          players: Object.fromEntries(game.playersInfo),
        });
      }

      console.log(`User ${currentUserId} joined room: ${roomId}`);
      console.log(`Players in DB for room: ${game.players.length}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Quiting Search 
  socket.on('quit_search', async ({ roomId }: { roomId: string }) => {
    try {
      const game = await Game.findOne({ roomId });
      if (!game || game.status === 'finished') {
        socket.emit('error', { message: 'Game not found or already finished.' });
        return;
      }



      await Game.deleteOne({ roomId });


      // Clean up socket room
      socket.leave(roomId);
      socket.data.roomId = undefined;

    } catch (error) {
      console.error('Error handlisng quit game:', error);
      socket.emit('error', { message: 'Failed to quit game.' });
    }
  });
};