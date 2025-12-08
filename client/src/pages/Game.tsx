import { useParams } from 'react-router-dom';

const Game = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Game Room: {id}</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl h-96 flex items-center justify-center">
        <p className="text-gray-600">Game interface will be implemented here.</p>
      </div>
    </div>
  );
};

export default Game;
