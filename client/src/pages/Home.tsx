import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Guess The Player</h1>
      <div className="space-x-4">
        <Link to="/auth" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login / Signup
        </Link>
        {/* Temporary link to a game for testing */}
        <Link to="/game/demo" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Join Demo Game
        </Link>
      </div>
    </div>
  );
};

export default Home;
