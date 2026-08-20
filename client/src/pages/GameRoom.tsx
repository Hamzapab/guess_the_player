import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { useSocketStore } from '../store/socketStore';
import { useAuth } from "@clerk/clerk-react"; 
import { useGameStore } from '../store/useGameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { joinRoom } from '../store/gameActions';

// TO DO : Implement these 
import { TurnHeader } from '../components/TurnHeader';
import { TargetCard } from '../components/TargetCard';
import { InterrogationChat } from '../components/TurnHeader';
import { SniperGuess } from '../components/SniperGuess';

export const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  
  // 1. Initialize the centralized engine listeners
  useGameEngine();

  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const status = useGameStore((state) => state.status);


  // 2. Lifecycle management: Connect on mount, disconnect on leave
  // !!!!!  GameRoom no longer connects/disconnects — App.tsx owns that lifecycle.
  // It just reacts to the socket already being connected.

  // 3. Once socket connects, automatically join the room ID from the URL
  useEffect(() => {
    console.log("CHeck ")
    console.log(isConnected && roomId)
    if (isConnected && roomId) {
      joinRoom(roomId);
    }
  }, [isConnected, socket, roomId]);

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
        <TargetCard />

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