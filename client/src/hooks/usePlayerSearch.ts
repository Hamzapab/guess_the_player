import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchPlayers } from '../api/gameApi';
import { useDebouncedValue } from './useDebouncedValue';
import type { Player } from '../components/SniperGuess';

const MIN_QUERY_LENGTH = 2;

export function usePlayerSearch(searchTerm: string, enabled = true) {
  const { getToken } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useDebouncedValue(searchTerm.trim(), 300);

  useEffect(() => {
    if (!enabled || query.length < MIN_QUERY_LENGTH) {
      setPlayers([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const { data } = await fetchPlayers(token, query, controller.signal);
        setPlayers(data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return; 
        setError('Could not load players.');
        setPlayers([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort(); 
  }, [query, enabled, getToken]);

  return { players, isLoading, error };
}