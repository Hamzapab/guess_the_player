import React, { useEffect , useState } from 'react';
import { useParams } from 'react-router-dom'; 
import {toast , Toaster} from 'react-hot-toast'; 
import { useSocketStore } from '../store/socketStore';
import { useGameStore } from '../store/useGameStore';
import { useGameEngine } from '../hooks/useGameEngine';
import { joinRoom } from '../store/gameActions';
import { TargetCard } from '../components/TargetCard';
import { InterrogationChat } from '../components/InterrogationChat'
import { SniperGuess } from '../components/SniperGuess';
import { WaitingLobby } from './LobbyWait';
import {  roomExists } from '../api/gameApi';
import { GameRoomHeader } from '../components/GameRoomHead';
import { GameOverModal } from '../components/GameOverModal';
import { OpponentCard } from '../components/OpponentCard';
import { MobileCard } from '../components/MobileCard';
import { useBlockBackNavigation } from '../hooks/useBlockBackNavigation';
import ConfirmQuitModal from "../components/ConfirmQuitModal";
import { useNavigate } from 'react-router-dom';
import { quitGame } from '../store/gameActions';



export const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const navigate = useNavigate();

  useBlockBackNavigation(() => setShowQuitConfirm(true));
  
  
  // 1. Initialize the centralized engine listeners
  useGameEngine();

  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const status = useGameStore((state) => state.status);
   const [roomStatus, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');

   // URL CHECk 
  useEffect(() => {
    if (!roomId) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await roomExists(roomId);
      if (cancelled) return;

      if (result === 'not found') {
        toast.error('Room Not Found');
        setStatus('denied');
        navigate('/', { replace: true });
        return;
      }

      if (result === 'Finished') {
        toast.error('Room Finished');
        setStatus('denied');
        navigate('/', { replace: true });
        return;
      }

      setStatus('ok');
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, navigate]);



  // 3. Once socket connects, automatically join the room ID from the URL
  useEffect(() => {
    if (roomStatus !== 'ok') return;
    if (isConnected && roomId) {
      joinRoom(roomId);
    }
  }, [isConnected, socket, roomId,roomStatus]);

  if (!isConnected) {
    return <div className="loading-screen">Connecting to game server...</div>;
  }

  if (status === 'waiting') {
    return <WaitingLobby />;
  }

  // quit handling
  const handleConfirmQuit = () => {
    quitGame();
    navigate("/")
  };

  if (roomStatus === 'checking') return <p>Checking room…</p>;
  if (roomStatus === 'denied') return null;
  return (
    <div className='bg-[#0C111A]'>
    <Toaster />
    {showQuitConfirm && (
        <ConfirmQuitModal
          onConfirm={handleConfirmQuit}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}
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