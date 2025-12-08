import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  return {
    socket: null,
    isConnected: false,

    connect: () => {
      const { socket: existingSocket, isConnected } = get();
      if (existingSocket || isConnected) return;

      const token = useAuthStore.getState().token;
      if (!token) return;

      const socket = io('http://localhost:5000', {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        set({ isConnected: true });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        set({ isConnected: false });
      });

      set({ socket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
      }
      set({ socket: null, isConnected: false });
    },
  };
});
