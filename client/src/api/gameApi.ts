

const BACKEND_API = import.meta.env.VITE_BACKEND_API


export const createGame = async (language: 'en' | 'fr' | 'ar', token: string | null) => {
  const response = await fetch('http://localhost:5000/api/games/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ language }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create game');
  }

  return response.json();
};


export const roomExists = async (roomCode: string): Promise<string> => {
  try {
    const res = await fetch(`http://localhost:5000/api/games/${roomCode}` , {method : "POST"});

    if (res.status === 404) {
      return "not found";           // room doesn't exist
    }

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();
    console.log(data.game)

    if(data.game.status === "finished"){
      return "Finished"
    }

    return "Game Found";              // 200 → room exists
  } catch (err) {
    console.error('roomExists error:', err);
    return "not found";           
  }
};

export const fetchPlayers = async (token: string | null) => {
  

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('http://localhost:5000/api/players', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch players');
  }

  return response.json();
};


export const fetchLeaderboardCall = async (
  queryParams: URLSearchParams,
  // token: string | null,
) => {
  const response = await fetch(
    `${BACKEND_API}/api/leaderboard?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch leaderboard');
  }

  return response.json();
};