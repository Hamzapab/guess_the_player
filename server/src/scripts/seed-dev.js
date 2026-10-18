

const SEED_TAG = "DEV_SEED_2024"; // marker so we can find them later
const now = new Date();
const todayStr = now.toISOString().slice(0, 10);       // "2026-10-17"
const monthStr = now.toISOString().slice(0, 7);        // "2026-10"

const fakePlayers = [
  { username: "alpha_wolf",   userId: "dev_001", wins: 42, losses: 8,  points: 1260 },
  { username: "nova_strike",  userId: "dev_002", wins: 38, losses: 12, points: 1140 },
  { username: "blaze_queen",  userId: "dev_003", wins: 35, losses: 15, points: 1050 },
  { username: "cyber_falcon", userId: "dev_004", wins: 31, losses: 19, points: 930  },
  { username: "shadow_panda", userId: "dev_005", wins: 28, losses: 22, points: 840  },
  { username: "mystic_owl",   userId: "dev_006", wins: 26, losses: 24, points: 780  },
  { username: "iron_viper",   userId: "dev_007", wins: 24, losses: 26, points: 720  },
  { username: "lunar_fox",    userId: "dev_008", wins: 22, losses: 28, points: 660  },
  { username: "storm_rider",  userId: "dev_009", wins: 20, losses: 30, points: 600  },
  { username: "pixel_ninja",  userId: "dev_010", wins: 18, losses: 32, points: 540  },
  { username: "titan_x",      userId: "dev_011", wins: 16, losses: 34, points: 480  },
  { username: "echo_spark",   userId: "dev_012", wins: 14, losses: 36, points: 420  },
  { username: "frost_bite",   userId: "dev_013", wins: 12, losses: 38, points: 360  },
  { username: "raven_claw",   userId: "dev_014", wins: 10, losses: 40, points: 300  },
  { username: "solar_flare",  userId: "dev_015", wins: 8,  losses: 42, points: 240  },
  { username: "quiet_thunder",userId: "dev_016", wins: 6,  losses: 44, points: 180  },
  { username: "neon_drift",   userId: "dev_017", wins: 5,  losses: 45, points: 150  },
  { username: "crimson_ace",  userId: "dev_018", wins: 4,  losses: 46, points: 120  },
  { username: "ghost_byte",   userId: "dev_019", wins: 3,  losses: 47, points: 90   },
  { username: "zero_kelvin",  userId: "dev_020", wins: 2,  losses: 48, points: 60   },
];

// Helper: build daily/monthly blocks so timeframe filters behave sensibly
const dailyBlock = (p, isActiveToday) => ({
  currentDate: isActiveToday ? todayStr : "",
  wins: isActiveToday ? Math.min(p.wins, 5) : 0,
  losses: isActiveToday ? Math.min(p.losses, 3) : 0,
  points: isActiveToday ? Math.min(p.points, 150) : 0,
});

const monthlyBlock = (p, isActiveThisMonth) => ({
  currentMonth: isActiveThisMonth ? monthStr : "",
  wins: isActiveThisMonth ? Math.floor(p.wins * 0.6) : 0,
  losses: isActiveThisMonth ? Math.floor(p.losses * 0.6) : 0,
  points: isActiveThisMonth ? Math.floor(p.points * 0.6) : 0,
});

const docs = [];

fakePlayers.forEach((p, i) => {
  // Only some players have "today" activity so the daily filter shows variety
  const activeToday = i % 3 === 0;
  const activeThisMonth = i % 2 === 0;

  const base = {
    userId: p.userId,
    username: p.username,
    avatar: null,
    __v: 0,
    createdAt: now,
    updatedAt: now,
    devSeed: SEED_TAG, // marker for cleanup
  };

  // ---- Season_1 record ----
  docs.push({
    ...base,
    seasonId: "Season_1",
    stats: { wins: p.wins, losses: p.losses, matchesPlayed: p.wins + p.losses, points: p.points },
    daily: dailyBlock(p, activeToday),
    monthly: monthlyBlock(p, activeThisMonth),
  });

  // ---- global record ----
  docs.push({
    ...base,
    seasonId: "global",
    stats: { wins: p.wins, losses: p.losses, matchesPlayed: p.wins + p.losses, points: p.points },
    daily: { currentDate: "", wins: 0, losses: 0, points: 0 },
    monthly: { currentMonth: "", wins: 0, losses: 0, points: 0 },
  });
});

// Insert and capture the generated _ids
const result = db.leaderboardstats.insertMany(docs);
const insertedIds = Object.values(result.insertedIds).map(id => id.toString());

print(`\n✅ Inserted ${insertedIds.length} dev leaderboard records.\n`);

// Save ids to a JSON file in the same directory as mongosh
const path = "./dev_seed_ids.json";
const json = JSON.stringify({ tag: SEED_TAG, createdAt: now, ids: insertedIds }, null, 2);
fs.writeFileSync(path, json);
print(`📝 Saved ids to ${path}\n`);


print("Inserted IDs:");
insertedIds.forEach(id => print("  " + id));



// Usage -> Go to current folder path -> mongosh -> load("seed-dev.js")
