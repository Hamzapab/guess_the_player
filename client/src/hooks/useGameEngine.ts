import { useEffect } from 'react';
import { useSocketStore } from '../store/socketStore';
import { useGameStore } from '../store/useGameStore';

export const useGameEngine = () => {
  // 1. Grab the active socket and the state updater function
  const socket = useSocketStore((state) => state.socket);
  const setRoomState = useGameStore((state) => state.setRoomState);

  useEffect(() => {
    // Not connected -> close
    if (!socket) return;

    // --- THE LISTENERS ---

    // 1. You successfully joined the lobby
    socket.on('room_joined', (data) => {
      setRoomState({ roomId: data.roomId, status: 'waiting' });
    });

    // 2. Both players are in! The match begins.
    socket.on('game_start_signal', (data) => {
      setRoomState({
        status: data.status,
        currentTurn: data.currentTurn,
      });

      // Ask the server for the secret card
      socket.emit('get_my_target_card', { roomId: data.roomId });
    });

    // 3. The server hands target card
    socket.on('your_target_card', (data) => {
      console.log("client recieve target card :" + data.targetCard)
      setRoomState({ myTargetCard: data.targetCard });
    });

    // 4. Question
    socket.on('question_received', (data) => {
      useGameStore.setState((state) => ({
        history: [...state.history, data.question],
      }));
    });

    // 5.  YES/NO, or missed a final guess & turn change
    socket.on('turn_resolved', (data) => {
      setRoomState({
        history: data.history,
        currentTurn: data.newTurn,
      });
      
      // Tip: If data.systemMessage exists (e.g., "Lost a life!"), 
      // trigger UI Toast notification right here.
    });

    // 6. The Grand Finale! Someone won or ran out of lives.
    socket.on('game_over', (data) => {
      setRoomState({
        status: 'finished',
        winnerId: data.winnerId,
        history: data.history,
      });
    });

    // 7. Security or Logic Errors
    socket.on('error', (data) => {
      console.error('Game Error:', data.message);
      // Replace this alert with a proper UI toast notification library later!
      alert(data.message); 
    });

    // ---  THE CLEANUP ---
    // If the user navigates away from the game page, React unmounts this hook.
    //  turn off the listeners so they don't double-fire if the user comes back.
    return () => {
      socket.off('room_joined');
      socket.off('game_start_signal');
      socket.off('your_target_card');
      socket.off('question_received');
      socket.off('turn_resolved');
      socket.off('game_over');
      socket.off('error');
    };
  }, [socket, setRoomState]); 
};