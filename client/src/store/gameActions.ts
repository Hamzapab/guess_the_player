import { useSocketStore } from './socketStore';
import { useGameStore } from './useGameStore';

/**
 * Join a specific multiplayer match room
 */
export const joinRoom = (roomId: string) => {
  const socket = useSocketStore.getState().socket;
  
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }
  
  if (!socket.connected) {
    console.error('Socket is not connected!');
    socket.connect();
    return;
  }
  
  console.log('Emitting join_room with roomId:', roomId);
  socket.emit('join_room', { roomId });
};

/**
 * Box 1: Send an open-ended natural language question to the opponent
 */
export const submitQuestion = (text: string) => {
  const socket = useSocketStore.getState().socket;
  const roomId = useGameStore.getState().roomId;
  
  if (!socket || !roomId) return console.error('Missing socket or roomId');

  socket.emit('submit_question', { roomId, text });
};

/**
 * Send a YES or NO answer back to the opponent's pending question
 */
export const submitAnswer = (answer: 'yes' | 'no') => {
  const socket = useSocketStore.getState().socket;
  const roomId = useGameStore.getState().roomId;

  if (!socket || !roomId) return console.error('Missing socket or roomId');

  socket.emit('submit_answer', { roomId, answer });
};

/**
 * Box 2: Use the Sniper Autocomplete to risk a final guess on a player ID
 */
export const submitFinalGuess = (guessedPlayerId: string) => {
  const socket = useSocketStore.getState().socket;
  const roomId = useGameStore.getState().roomId;

  if (!socket || !roomId) return console.error('Missing socket or roomId');

  socket.emit('submit_final_guess', { roomId, guessedPlayerId });
};