import { Server, Socket } from 'socket.io';


export const matchMakingHandler = (
  io: Server,
  socket: Socket,
  matchmakingQueue : { socket: Socket; userId: string }[],
  attemptMatchmaking: (matchmakingQueue: { socket: Socket; userId: string }[]) => void,
 ) => {
  const user = socket.data.user;

  socket.on('join_matchmaking', () => {
    const user = socket.data.user;
    const userId = user?.userId;
    
    // Prevent the same user from joining the queue twice from different tabs
    const isAlreadyInQueue = matchmakingQueue.some(p => p.userId === userId);
    
    if (!isAlreadyInQueue) {
      matchmakingQueue.push({ socket, userId });
      console.log(`User ${userId} joined matchmaking. Queue size: ${matchmakingQueue.length}`);
      
      // Immediately check if we can form a match
      attemptMatchmaking(matchmakingQueue);
    }
  });

  socket.on('leave_matchmaking', () => {
     const user = socket.data.user;
    const userId = user?.userId;
    matchmakingQueue = matchmakingQueue.filter(p => p.userId !== userId);
    console.log(`User ${userId} left matchmaking. Queue size: ${matchmakingQueue.length}`);
  });
  
};