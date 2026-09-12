import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { useSocketStore } from '../store/socketStore';
import { useGameStore } from '../store/useGameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { joinRoom } from '../store/gameActions';
import { TargetCard } from '../components/TargetCard';
import { InterrogationChat } from '../components/InterrogationChat'
import { SniperGuess } from '../components/SniperGuess';
import { WaitingLobby } from './LobbyWait';
import { GameRoomHeader } from '../components/GameRoomHead';
import { GameOverModal } from '../components/GameOverModal';
import { OpponentCard } from '../components/OpponentCard';
import { MobileCard } from '../components/MobileCard';

export const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  
  // 1. Initialize the centralized engine listeners
  useGameEngine();

  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const status = useGameStore((state) => state.status);



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
    return <WaitingLobby />;
  }

  return (
    <div className='bg-[#0C111A]'>
     <GameRoomHeader />
     <div className="game-layout-container">
      {/* Top Bar: Turn info & Lives */}


      <div className="main-game-grid flex flex-col md:flex-row ">
        {/* Left/Static Column: Your Secret Identity */}
        <TargetCard />
        <MobileCard />

        {/* Dynamic Action Center */}
        <div className="flex-1 action-center">
          {status === 'finished' ? (
            <GameOverModal />
          ) : (
            <>
              <InterrogationChat />
              
              <SniperGuess />
            </>
          )}
        </div>

        {/* right column : OP Card */}
        <OpponentCard />
      </div>
    </div>
    </div>
  );
};