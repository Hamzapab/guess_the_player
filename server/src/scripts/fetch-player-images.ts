/**
 * Resolves a player image from TheSportsDB for every player in players.ts.
 *
 * Run:    npx tsx fetch-player-images-sportsdb.ts
 * Redo:   npx tsx fetch-player-images-sportsdb.ts --force   (ignore cached results)
 * Key:    THESPORTSDB_KEY=yourKey npx tsx ...               (defaults to the free test key "123")
 * Out:    player-images.json  (name -> { status, url?, thumb?, cutout?, matchedName?, team? })
 */
import { readFile, writeFile } from 'node:fs/promises';
import { players } from './playersList.js';

const API_KEY = process.env.THESPORTSDB_KEY ?? '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchplayers.php`;
const OUTPUT_FILE = 'player-images.json';
const DELAY_MS = 2200; 
const MAX_RETRIES = 10;
const SAVE_EVERY = 10;

/** Select prefered image */
const IMAGE_PRIORITY = ['strThumb'] as const;


const SEARCH_OVERRIDES: Record<string, string> = {
  'Neymar Jr': 'Neymar',
  'Xavi Hernández': 'Xavi',
  'Raúl González': 'Raul',
  'Alisson Becker': 'Alisson',
  Bono: 'Yassine Bounou',
};

interface SportsDbPlayer {
  strPlayer: string;
  strSport?: string | null;
  strTeam?: string | null;
  strNationality?: string | null;
  strThumb?: string | null;
  strCutout?: string | null;
  strRender?: string | null;
}

type Status = 'ok' | 'review' | 'no-image' | 'not-found';

interface ImageResult {
  status: Status;
  url?: string;
  thumb?: string;
  cutout?: string;
  matchedName?: string;
  team?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// "Kaká" -> "kaka" 
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

async function search(query: string): Promise<SportsDbPlayer[]> {
  // The docs use underscores for spaces; encode everything else.
  const url = `${BASE_URL}?p=${encodeURIComponent(query.replace(/\s+/g, '_'))}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url);

    if (res.ok) {
      const data = (await res.json()) as { player?: SportsDbPlayer[] | null };
      return data.player ?? []; 
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(DELAY_MS * 2 ** (attempt + 1)); 
      continue;
    }
    throw new Error(`TheSportsDB responded ${res.status} for "${query}"`);
  }
  throw new Error(`TheSportsDB: retries exhausted for "${query}"`);
}

function pickImage(p: SportsDbPlayer): string | undefined {
  for (const field of IMAGE_PRIORITY) {
    const value = p[field];
    if (value) return value;
  }
  return undefined;
}

function toResult(p: SportsDbPlayer, status: Status): ImageResult {
  const url = pickImage(p);
  return {
    status: url ? status : 'no-image',
    url,
    thumb: p.strThumb ?? undefined,
    cutout: p.strCutout ?? undefined,
    matchedName: p.strPlayer,
    team: p.strTeam ?? undefined,
  };
}

async function resolvePlayer(name: string, club: string): Promise<ImageResult> {
  const primary = SEARCH_OVERRIDES[name] ?? name;

  const queries = [...new Set([primary, normalize(primary)])];

  for (const query of queries) {
    const soccer = (await search(query)).filter((p) => p.strSport === 'Soccer');
    if (soccer.length === 0) {
      await sleep(DELAY_MS);
      continue;
    }

    const exact = soccer.filter((p) => normalize(p.strPlayer) === normalize(name));
    if (exact.length === 1) return toResult(exact[0], 'ok');

    if (exact.length > 1) {
      // Same name, several people (e.g. two "Rodri"s): break the tie with the club.
      const sameClub = exact.filter(
        (p) => p.strTeam && normalize(p.strTeam).includes(normalize(club).split(' ')[0]),
      );
      if (sameClub.length === 1) return toResult(sameClub[0], 'ok');
      return toResult(exact[0], 'review');
    }

    return toResult(soccer[0], 'review');
  }
  return { status: 'not-found' };
}

async function loadCache(): Promise<Record<string, ImageResult>> {
  if (process.argv.includes('--force')) return {};
  try {
    return JSON.parse(await readFile(OUTPUT_FILE, 'utf8')) as Record<string, ImageResult>;
  } catch {
    return {}; 
  }
}

async function main() {
  const output = await loadCache();
  const todo = players.filter((p) => output[p.name]?.status !== 'ok');
  console.log(`${players.length - todo.length} cached, ${todo.length} to fetch (~${Math.ceil((todo.length * DELAY_MS) / 60000)} min)`);

  for (const [i, player] of todo.entries()) {
    output[player.name] = await resolvePlayer(player.name, player.club);
    console.log(`[${i + 1}/${todo.length}] ${player.name}: ${output[player.name].status}`);

    if ((i + 1) % SAVE_EVERY === 0) await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
    await sleep(DELAY_MS);
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  const entries = Object.entries(output);
  console.log(`\nResolved ${entries.filter(([, r]) => r.status === 'ok').length}/${entries.length} cleanly.`);
  for (const status of ['review', 'not-found', 'no-image'] as const) {
    const lines = entries
      .filter(([, r]) => r.status === status)
      .map(([n, r]) => (r.matchedName ? `${n}  ->  matched "${r.matchedName}" (${r.team ?? '?'})` : n));
    if (lines.length) console.log(`\n[${status}] ${lines.length}:\n  ${lines.join('\n  ')}`);
  }
  console.log('\nFix [review]/[not-found] via SEARCH_OVERRIDES and re-run (cached "ok" entries are skipped).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});