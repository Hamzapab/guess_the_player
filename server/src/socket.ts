import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Game from './models/Game.js';
import Player from './models/Player.js';
import { is } from 'zod/locales';

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

     socket.onAny((eventName, ...args) => {
    console.log(`[DEBUG] Event received: ${eventName}`, args);
  });

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
        console.log("The checK")
        console.log("User : " + currentUserId);
        console.log(isAlreadyInRoom);

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
      console.log("Server emit target card" )
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

    // Game Loop Engine 

    // Question
    socket.on('submit_question', async ({ roomId, text }: { roomId: string, text: string }) => {
      try {
        const game = await Game.findOne({ roomId });
        if (!game || game.status !== 'active') return;

        const currentUserId = user?.userId;

        // 1. Security Check: Is it actually this player's turn?
        if (game.currentTurn.toString() !== currentUserId) {
          socket.emit('error', { message: 'It is not your turn to ask a question!' });
          return;
        }

        // 2. Add the question to the game history
        const newHistoryItem = {
          action: 'question',
          playerId: currentUserId,
          timestamp: new Date(),
          details: {
            text: text,
            answer: 'pending'
          }
        };

        game.history.push(newHistoryItem);
        await game.save();

        // 3. Forward the question to the room so the opponent sees it
        io.to(roomId).emit('question_received', {
          question: newHistoryItem,
          message: 'Opponent asked a question. Waiting for answer...'
        });

      } catch (error) {
        console.error('Error submitting question:', error);
        socket.emit('error', { message: 'Failed to submit question.' });
      }
    });

    // Response

    socket.on('submit_answer', async ({ roomId, answer }: { roomId: string, answer: 'yes' | 'no' }) => {
      try {
        const game = await Game.findOne({ roomId });
        if (!game || game.status !== 'active') return;

        const currentUserId = user?.userId;

        // 1. Security Check: The person answering must NOT be the person whose turn it is
        if (game.currentTurn.toString() === currentUserId) {
          socket.emit('error', { message: 'You cannot answer your own question!' });
          return;
        }

        // 2. Find the last pending question in the history
        const lastHistoryIndex = game.history.length - 1;
        if (lastHistoryIndex < 0 || game.history[lastHistoryIndex].details.answer !== 'pending') {
          socket.emit('error', { message: 'There is no pending question to answer.' });
          return;
        }

        // 3. Record the answer
        game.history.push({
          action: 'answer',
          playerId: currentUserId,
          timestamp: new Date(),
          details: {
            answer: answer
          }
        });

        // 4. Switch the turn! 
        // If it was Player 1's turn, make it Player 2's turn, and vice versa.
        const player1Id = game.players[0];
        const player2Id = game.players[1];
        game.currentTurn = (game.currentTurn.toString() === player1Id.toString()) ? player2Id : player1Id;

        await game.save();

        // 5. Broadcast the result and the new turn to both players
        io.to(roomId).emit('turn_resolved', {
          history: game.history,
          newTurn: game.currentTurn
        });

      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit('error', { message: 'Failed to submit answer.' });
      }
    });

    socket.on('submit_final_guess', async ({ roomId, guessedPlayerId }: { roomId: string, guessedPlayerId: string }) => {
      try {
        const game = await Game.findOne({ roomId });
        if (!game || game.status !== 'active') return;

        const currentUserId = user?.userId;

        // Security Check: Is it their turn?
        if (game.currentTurn.toString() !== currentUserId) {
          socket.emit('error', { message: 'It is not your turn to guess!' });
          return;
        }

        const player1Id = game.players[0];
        const player2Id = game.players[1];
        const opponentId = (currentUserId.toString() === player1Id.toString()) ? player1Id : player2Id;
        const opponentTargetCardId = game.targetPlayers.get(opponentId.toString());
      

        if (!opponentTargetCardId) return;

        // --- THE 3 LIVES LOGIC ---

        if (guessedPlayerId === opponentTargetCardId) {
          //  CORRECT GUESS!.
          game.status = 'finished';
          game.winner = currentUserId;

          game.history.push({
            action: 'final_guess',
            playerId: currentUserId,
            timestamp: new Date(),
            details: {
              guessedPlayerId: guessedPlayerId,
              answer: 'correct'
            }
          });

          await game.save();

          io.to(roomId).emit('game_over', {
            winnerId: currentUserId,
            isCorrectGuess: true,
            guessedPlayerId: guessedPlayerId,
            actualTargetId: opponentTargetCardId,
            history: game.history
          });

        } else {
          // WRONG GUESS! Lose a life.

          // Get current lives (default to 3 if not set)
          let currentLives = game.remainingGuesses.get(currentUserId) ?? 3;
          currentLives -= 1;
          game.remainingGuesses.set(currentUserId, currentLives);

          game.history.push({
            action: 'final_guess',
            playerId: currentUserId,
            timestamp: new Date(),
            details: {
              guessedPlayerId: guessedPlayerId,
              answer: 'incorrect'
            }
          });

          if (currentLives <= 0) {
            // OUT OF LIVES! Game Over. Opponent wins.
            game.status = 'finished';
            game.winner = opponentId;
            await game.save();

            io.to(roomId).emit('game_over', {
              winnerId: opponentId,
              isCorrectGuess: false,
              guessedPlayerId: guessedPlayerId,
              actualTargetId: opponentTargetCardId,
              reason: 'out_of_lives',
              history: game.history
            });

          } else {
            // STILL ALIVE! Switch turn and continue.
            game.currentTurn = opponentId;
            await game.save();

            // We emit 'turn_resolved' just like a normal question so the UI updates
            io.to(roomId).emit('turn_resolved', {
              history: game.history,
              newTurn: game.currentTurn,
              systemMessage: `Wrong guess! The opponent has ${currentLives} guesses remaining.`
            });
          }
        }

      } catch (error) {
        console.error('Error submitting final guess:', error);
        socket.emit('error', { message: 'Failed to process final guess.' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
