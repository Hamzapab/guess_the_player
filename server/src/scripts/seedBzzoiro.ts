
import 'dotenv/config';
import mongoose from 'mongoose';
import Player from '../models/Player.js';
import { normalize } from '../utils/search.js';
import { mapPosition, PlayerPosition } from '../utils/bzzoiro.js';
import {
  fetchTeamsByLeague,
  fetchSquad,
  fetchPlayerProfile,
  playerImageUrl,
  BzzPlayerProfile,
} from '../utils/bzzoiro.js';

// --- Configuration ---

const MONGO_URI = process.env.MONGO_URI!;
if (!MONGO_URI) throw new Error('MONGO_URI is missing');

const LEAGUES: { id: number; name: string; seasonId?: number }[] = [
  { id: 1,  name: 'Premier League', seasonId: 1058 },
  { id: 3,   name: 'La Liga',         seasonId: 1307 },
  { id: 4,  name: 'Serie A',         seasonId: 1375 },
  { id: 5,  name: 'Bundesliga',      seasonId: 1091 },
  { id: 6,  name: 'Ligue 1',         seasonId: 1311 },
  { id: 17,  name: 'Saudi Pro League', seasonId: 1631 },
];


const LEGEND_NAMES = new Set(
  [
    'Lionel Messi',
    'Cristiano Ronaldo',
    'Neymar',
    'Kylian Mbappé',
    'Erling Haaland',
    'Kevin De Bruyne',
    'Mohamed Salah',
    'Luka Modrić',
    'Robert Lewandowski',
    'Sergio Ramos',
    'Andrés Iniesta',
    'Xavi',
  ].map((n) => normalize(n)) 
);

const CALL_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));



interface IPlayerSeed {
  name: string;
  searchName: string;
  nationality: string;
  club: string;
  league: string;
  position: PlayerPosition;
  height: number;
  age: number;
  shirtNum: number;
  imageUrl: string;
  isLegend: boolean;
  bzzoiroId: number;  
}



function transformPlayer(
  profile: BzzPlayerProfile,
  squadPlayer: { position?: string; shirt_number?: number | null },
  teamName: string,
  leagueName: string
): IPlayerSeed | null {
  
  if (!profile.name || !teamName || !leagueName) return null;

  const position = mapPosition(profile.position ?? squadPlayer.position);
  if (!position) return null; 

  const nationality = profile.nationality ?? '';
  if (!nationality) return null;


  let age = profile.age ?? 0;
  if (!age && profile.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    if (!isNaN(dob.getTime())) {
      age = new Date().getFullYear() - dob.getFullYear();
    }
  }

  return {
    name: profile.name,
    searchName: normalize(profile.name),
    nationality,
    club: teamName,
    league: leagueName,
    position,
    height: profile.height ?? 0,
    age,
    shirtNum: profile.shirt_number ?? squadPlayer.shirt_number ?? 0,
    imageUrl: playerImageUrl(profile.id),
    isLegend: LEGEND_NAMES.has(normalize(profile.name)),
    bzzoiroId: profile.id,
  };
}



async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const seen = new Set<number>();      
  const allPlayers: IPlayerSeed[] = [];
  let skipped = 0;
  let failed = 0;

  for (const league of LEAGUES) {
    console.log(`\n=== League: ${league.name} (id=${league.id}) ===`);

    let teams;
    try {
      teams = await fetchTeamsByLeague(league.id, league.seasonId);
      console.log(`  Found ${teams.length} teams`);
    } catch (err) {
      console.error(`  Failed to fetch teams for ${league.name}:`, (err as Error).message);
      continue;
    }

    for (const team of teams) {
      await sleep(CALL_DELAY_MS);
      console.log(`  → Team: ${team.name} (id=${team.id})`);

      let squad;
      try {
        squad = await fetchSquad(team.id);
      } catch (err) {
        console.error(`    ✗ Squad fetch failed:`, (err as Error).message);
        failed++;
        continue;
      }

      const squadPlayers = squad.players ?? [];
      console.log(`    ${squadPlayers.length} players in squad`);

      for (const sp of squadPlayers) {
        if (seen.has(sp.id)) continue;   // already processed in another league
        seen.add(sp.id);

        await sleep(CALL_DELAY_MS);

        let profile: BzzPlayerProfile;
        try {
          profile = await fetchPlayerProfile(sp.id);
        } catch (err) {
          console.error(`    ✗ Profile fetch failed for ${sp.name} (${sp.id}):`, (err as Error).message);
          failed++;
          continue;
        }

        const seed = transformPlayer(profile, sp, team.name, league.name);
        if (!seed) {
          skipped++;
          continue;
        }

        allPlayers.push(seed);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Players collected: ${allPlayers.length}`);
  console.log(`  Skipped (invalid): ${skipped}`);
  console.log(`  Failed requests:   ${failed}`);

  if (allPlayers.length === 0) {
    console.warn('Nothing to insert — aborting.');
    await mongoose.disconnect();
    return;
  }

  
  console.log('\nUpserting into MongoDB...');
  const bulkOps = allPlayers.map((p) => ({
    updateOne: {
      filter: { bzzoiroId: p.bzzoiroId },
      update: { $set: p },
      upsert: true, // if miss -> create
    },
  }));

  const result = await Player.bulkWrite(bulkOps, { ordered: false });
  console.log(`  Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

  //  hard reset 
  // await Player.deleteMany({});
  // await Player.insertMany(allPlayers);
  // console.log('  Hard reset + insert done.');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seeder failed:', err);
  process.exit(1);
});