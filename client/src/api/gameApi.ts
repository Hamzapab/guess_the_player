import { useAuthStore } from '../store/authStore';

export const createGame = async (language: 'en' | 'fr' | 'ar') => {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error('Not authenticated');
  }

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

export const fetchPlayers = async () => {

  const token = useAuthStore.getState().token;

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