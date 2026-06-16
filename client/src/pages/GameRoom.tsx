import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { useSocketStore } from '../store/socketStore';
import { useGameStore } from '../store/useGameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { joinRoom } from '../store/gameActions';

// TO DO : Implement these 
import { TurnHeader } from '../components/TurnHeader';
// import { TargetCard } from '../components/TargetCard';
import { InterrogationChat } from '../components/TurnHeader';
import { SniperGuess } from '../components/SniperGuess';

export const GameRoom: React.FC = () => {
  const { roomIdParam } = useParams<{ roomIdParam: string }>();
  
  // 1. Initialize the centralized engine listeners
  useGameEngine();

  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);
  const status = useGameStore((state) => state.status);

  // 2. Lifecycle management: Connect on mount, disconnect on leave
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 3. Once socket connects, automatically join the room room ID from the URL
  useEffect(() => {
    if (isConnected && roomIdParam) {
      joinRoom(roomIdParam);
    }
  }, [isConnected, roomIdParam]);

  if (!isConnected) {
    return <div className="loading-screen">Connecting to game server...</div>;
  }

  if (status === 'waiting') {
    return <div className="lobby-screen">Waiting for an opponent to join...</div>;
  }

  return (
    <div className="game-layout-container">
      {/* Top Bar: Turn info & Lives */}
      <TurnHeader />

      <div className="main-game-grid">
        {/* Left/Static Column: Your Secret Identity */}
        {/* <TargetCard /> */}

        {/* Dynamic Action Center */}
        <div className="action-center">
          {status === 'finished' ? (
            <div className="game-over-banner">Game Over!</div>
          ) : (
            <>
              <InterrogationChat />
              
              <SniperGuess />
            </>
          )}
        </div>
      </div>
    </div>
  );
};