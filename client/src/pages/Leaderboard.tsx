import { useMemo, useState, type ChangeEvent } from "react";
import { Header } from "../components/Header";
import { PodiumCard } from "../components/leaderboard_components/PodiumCard";
import { Avatar } from "../components/leaderboard_components/PodiumCard";
import type { Player } from "../components/leaderboard_components/PodiumCard";
import type { RankedPlayer } from "../components/leaderboard_components/PodiumCard";
import { Footer } from "../components/Footer";



// Rank is computed client-side after sorting, so it gets its own type
// instead of being optional on Player.

type PeriodId = "allTime" | "weekly" | "monthly";
type Podium = [RankedPlayer, RankedPlayer, RankedPlayer];


/* ---------- Constants ---------- */
const MOCK_PLAYERS: Player[] = [
  { id: 1, name: "GoalKing", points: 2800, wins: 180, losses: 20, avatar: null },
  { id: 2, name: "Striker99", points: 2450, wins: 142, losses: 34, avatar: null },
  { id: 3, name: "NetMaster", points: 2300, wins: 110, losses: 45, avatar: null },
  { id: 4, name: "SpeedDemon", points: 2150, wins: 98, losses: 42, avatar: null },
  { id: 5, name: "TacticalGenius", points: 2080, wins: 90, losses: 30, avatar: null },
  { id: 6, name: "MidfieldMaestro", points: 1950, wins: 85, losses: 50, avatar: null },
  { id: 7, name: "GoalPost", points: 1820, wins: 78, losses: 44, avatar: null },
];

const PERIODS: readonly { id: PeriodId; label: string }[] = [
  { id: "allTime", label: "All Time" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];



/* ---------- Helpers ---------- */
const getWinRatio = ({ wins, losses }: Pick<Player, "wins" | "losses">): number => {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
};

const formatPoints = (n: number): string => n.toLocaleString("en-US");

// Narrowing helper: returns a fixed-length tuple or null, so the JSX below
// never has to deal with `RankedPlayer | undefined`.
const toPodium = (players: RankedPlayer[]): Podium | null => {
  const [first, second, third] = players;
  return first && second && third ? [first, second, third] : null;
};





/* ---------- Page ---------- */
const Leaderboard = () => {
  const [period, setPeriod] = useState<PeriodId>("allTime");
  const [query, setQuery] = useState<string>("");

  // TODO: fetch by `period` (e.g. GET /api/leaderboard?period=weekly)
  // Ranks are assigned BEFORE filtering so searching never changes a player's rank.
  const rankedPlayers = useMemo<RankedPlayer[]>(
    () =>
      [...MOCK_PLAYERS]
        .sort((a, b) => b.points - a.points)
        .map((player, index) => ({ ...player, rank: index + 1 })),
    // `period` is a placeholder dependency until the data comes from an API
    [period]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visiblePlayers = useMemo<RankedPlayer[]>(
    () =>
      isSearching
        ? rankedPlayers.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
        : rankedPlayers,
    [rankedPlayers, normalizedQuery, isSearching]
  );

  // Podium only shows in the default view; searching switches to a flat list
  const podium = isSearching ? null : toPodium(rankedPlayers);
  const tablePlayers = isSearching ? visiblePlayers : rankedPlayers.slice(3);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-[#0b1220] px-4 py-10 text-slate-200">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Global Rankings</h1>
              <p className="mt-1 text-sm text-slate-400">See who dominates the pitch this season.</p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              SEASON 4 LIVE
            </span>
          </header>

          {/* Controls */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block flex-1 sm:max-w-sm">
              <span className="sr-only">Search players</span>
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={handleSearch}
                placeholder="Find friends or rivals..."
                className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </label>

            <div
              className="inline-flex rounded-lg border border-slate-700/60 bg-slate-800/60 p-1"
              role="group"
              aria-label="Time period"
            >
              {PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={period === id}
                  onClick={() => setPeriod(id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${period === id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Podium: DOM order is 1st, 2nd, 3rd (better for screen readers and mobile),
            visual order is 2nd, 1st, 3rd on larger screens via `order-*`. */}
          {podium && (
            <section
              className="mt-12 grid grid-cols-1 items-end gap-4 sm:grid-cols-3"
              aria-label="Top three players"
            >
              <div className="sm:order-2">
                <PodiumCard player={podium[0]} rank={1} />
              </div>
              <div className="sm:order-1">
                <PodiumCard player={podium[1]} rank={2} />
              </div>
              <div className="sm:order-3">
                <PodiumCard player={podium[2]} rank={3} />
              </div>
            </section>
          )}

          {/* Table */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-[11px] uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-4 py-3 font-semibold">#</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Player</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-blue-400">Points</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Wins</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Losses</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Win Ratio</th>
                </tr>
              </thead>
              <tbody>
                {tablePlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-slate-700/40 last:border-0 hover:bg-slate-700/20"
                  >
                    <td className="px-4 py-4 text-slate-400">{player.rank}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar player={player} className="h-8 w-8 text-xs" />
                        <span className="font-semibold text-white">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-white">
                      {formatPoints(player.points)}
                    </td>
                    <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">{player.wins}</td>
                    <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">{player.losses}</td>
                    <td className="px-4 py-4 text-right text-slate-300">{getWinRatio(player)}%</td>
                  </tr>
                ))}

                {tablePlayers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      {isSearching ? `No players match "${query}".` : "No more players yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;