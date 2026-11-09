// import { normalize } from "search"

const BASE_URL = 'https://sports.bzzoiro.com/api/v2';
const API_KEY = process.env.BZZOIRO_API_KEY;

if (!API_KEY) {
  throw new Error('BZZOIRO_API_KEY is missing from environment');
}


export interface BzzTeam {
  id: number;
  name: string;
  country: string;
  country_code: string;
}

export interface BzzSquadPlayer {
  id: number;
  name: string;
  position?: string;         // 'G' | 'D' | 'M' | 'F'
  shirt_number?: number | null;
  availability?: string;
}

export interface BzzSquad {
  team?: { id: number; name: string };
  players: BzzSquadPlayer[];
}

export interface BzzPlayerProfile {
  id: number;
  name: string;
  nationality?: string;
  country_code?: string;
  position?: string;
  height?: number | null;
  age?: number | null;
  shirt_number?: number | null;
  team?: { id: number; name: string };
  league?: { id: number; name: string };
  date_of_birth?: string | null;
}



const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function apiFetch<T>(path: string, retries = 3): Promise<T> {
  const url = `${BASE_URL}${path}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Token ${API_KEY}` },
      });

      if (res.status === 429) {
        // Rate-limited — back off exponentially
        const wait = 2000 * attempt;
        console.warn(`429 on ${path}, waiting ${wait}ms (attempt ${attempt})`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} on ${path}: ${await res.text()}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Retry ${attempt}/${retries} for ${path}:`, (err as Error).message);
      await sleep(1000 * attempt);
    }
  }

  throw new Error(`Exhausted retries for ${path}`);
}


export async function fetchTeamsByLeague(
  leagueId: number,
  seasonId?: number,
  limit = 100
): Promise<BzzTeam[]> {
  const params = new URLSearchParams({
    league_id: String(leagueId),
    limit: String(limit),
  });
  if (seasonId) params.set('season_id', String(seasonId));

  // The API might return either an array or { results: [...] } — handle both.
  const data = await apiFetch<any>(`/teams/?${params.toString()}`);
  const list: any[] = Array.isArray(data) ? data : data.results ?? data.data ?? [];
  return list;
}

/** Current squad, ordered by position then shirt number. */
export async function fetchSquad(teamId: number): Promise<BzzSquad> {
  return apiFetch<BzzSquad>(`/teams/${teamId}/squad/`);
}

/** Player bio: name, nationality, height, age, position, current team ... */
export async function fetchPlayerProfile(playerId: number): Promise<BzzPlayerProfile> {
  return apiFetch<BzzPlayerProfile>(`/players/${playerId}/`);
}

/** Image URL is constructed from the player ID  */
export function playerImageUrl(playerId: number): string {
  return `https://sports.bzzoiro.com/img/player/${playerId}/?sor=true&bg=transparent`;
}



// Helper 

// Map Position
export type BzzPosition = 'G' | 'D' | 'M' | 'F' | string | undefined | null;

export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

const POSITION_MAP: Record<string, PlayerPosition> = {
  G: 'Goalkeeper',
  D: 'Defender',
  M: 'Midfielder',
  F: 'Forward',
  Goalkeeper: 'Goalkeeper',
  Defender: 'Defender',
  Midfielder: 'Midfielder',
  Forward: 'Forward',
  Attacker: 'Forward',
  Striker: 'Forward',
};

export function mapPosition(pos: BzzPosition): PlayerPosition | null {
  if (!pos) return null;
  return POSITION_MAP[pos] ?? POSITION_MAP[pos[0]?.toUpperCase()] ?? null;
}

