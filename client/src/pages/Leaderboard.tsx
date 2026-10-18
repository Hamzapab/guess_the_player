import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Header } from "../components/Header";
import { fetchLeaderboardCall } from "../api/gameApi";
import { PodiumCard, Avatar } from "../components/leaderboard_components/PodiumCard";
import type {  RankedPlayer } from "../components/leaderboard_components/PodiumCard";
import { Footer } from "../components/Footer";

type PeriodId = "daily" | "monthly" | "all";
type Podium = [RankedPlayer, RankedPlayer, RankedPlayer];

interface ApiLeaderboardItem {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
}

const PERIODS: readonly { id: PeriodId; label: string; timeframe: string }[] = [
  { id: "daily", label: "Daily", timeframe: "daily" },
  { id: "monthly", label: "Monthly", timeframe: "monthly" },
  { id: "all", label: "All Time", timeframe: "all" },
];

/* ---------- Helpers ---------- */
const getWinRatio = ({ wins, losses }: { wins: number; losses: number }): number => {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
};

const formatPoints = (n: number): string => n.toLocaleString("en-US");

const toPodium = (players: RankedPlayer[]): Podium | null => {
  const [first, second, third] = players;
  return first && second && third ? [first, second, third] : null;
};

/* ---------- Page ---------- */
const Leaderboard = ({ currentUserId }: { currentUserId?: string | null }) => {
  const [period, setPeriod] = useState<PeriodId>("all");
  const [seasonId, setSeasonId] = useState<string>("Season_1");
  const [query, setQuery] = useState<string>("");
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [outOfBoundsUser, setOutOfBoundsUser] = useState<RankedPlayer | null>(null);

  

  // Fetch live leaderboard data from Backend API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      const activeTimeframe = PERIODS.find((p) => p.id === period)?.timeframe || "all";
   

      try {
        const queryParams = new URLSearchParams({
          seasonId,
          limit: "20", // TOP List
        });

        if (seasonId !== "global") {
          queryParams.set("timeframe", activeTimeframe);
        }


        if (currentUserId) {
          queryParams.append("userId", currentUserId);
        }

        const response = await fetchLeaderboardCall(queryParams);
        const data = await response;
      

        if (data.success && Array.isArray(data.leaderboard)) {
          // Map API schema to UI Player structure
          const formattedPlayers: RankedPlayer[] = data.leaderboard.map(
            (item: ApiLeaderboardItem) => {
              const isMe = currentUserId && String(item.userId) === String(currentUserId);
              return {
              id: item.userId,
              name: isMe ? "You" : (item.username || "Unknown Player"),
              points: item.points || 0,
              wins: item.wins || 0,
              losses: item.losses || 0,
              avatar: item.avatar || null,
              rank: item.rank,
            }}
          );
          setPlayers(formattedPlayers);
          // User not in Top Limit
          if (data.userRank) {
            setOutOfBoundsUser({
              id: data.userRank.userId,
              name: "You",
              points: data.userRank.points,
              wins: data.userRank.wins,
              losses: data.userRank.losses,
              avatar: data.userRank.avatar || null,
              rank: data.userRank.rank,
            });
          } else {
            setOutOfBoundsUser(null);
          }
        } else {
          setError(data.message || "Failed to load leaderboard data.");
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError("Network error. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, seasonId, currentUserId]);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visiblePlayers = useMemo<RankedPlayer[]>(
    () =>
      isSearching
        ? players.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
        : players,
    [players, normalizedQuery, isSearching]
  );

  // Podium shows only when not searching and at least 3 top players exist
  const podium = isSearching ? null : toPodium(players);
  const tablePlayers = isSearching ? visiblePlayers : players.slice(3);

  
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

  const SHOWN_DASHBOARD = false;

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-[#0b1220] px-4 py-10 text-slate-200">
        <div className="mx-auto max-w-3xl">
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent p-6 sm:p-8 text-center">
    {/* Badge */}
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
      Season Starting Soon
    </div>

    {/* Headline */}
    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
      The leaderboard is warming up
    </h2>

    {/* Placeholder body */}
    <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
      No ranked players yet — be one of the first to claim the top spot.
      Win your matches and your name will show up here.
    </p>

    {/* Hook line */}
    <p className="mt-4 text-base font-semibold text-white sm:text-lg">
      Win to get to the top of the list.
    </p>

  </div>
</div>
        {SHOWN_DASHBOARD && <div className="mx-auto max-w-3xl">

          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Global Rankings</h1>
              <p className="mt-1 text-sm text-slate-400">
                See who dominates the pitch this season.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Season Selector */}
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-blue-500"
              >
                <option value="Season_1">Season 1 (Active)</option>
                <option value="global">Lifetime (Global)</option>
              </select>

              <span className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>
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
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    period === id
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="mt-12 space-y-4">
              <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-800/40" />
              <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-800/40" />
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Podium */}
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
                    {tablePlayers.map((player) => {
                      const isCurrentUser = String(player.id) === String(currentUserId);
                      console.log(String(player.id))
                      console.log(String(currentUserId))
                      console.log("#################")

                      return (
                        <tr
                          key={player.id}
                          className={`border-b border-slate-700/40 last:border-0 hover:bg-slate-700/20 transition-colors ${
                            isCurrentUser ? "bg-blue-600/10 font-bold border-blue-500/30 text-amber-300" : ""
                          }`}
                        >
                          <td className="px-4 py-4 text-slate-400">
                            {isCurrentUser ? (
                              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white font-bold">
                                #{player.rank}
                              </span>
                            ) : (
                              player.rank
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar player={player} className="h-8 w-8 text-xs" />
                              <span className={`font-semibold ${isCurrentUser ? "text-blue-400" : "text-white"}`}>
                                {player.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-white">
                            {formatPoints(player.points)}
                          </td>
                          <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">
                            {player.wins}
                          </td>
                          <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">
                            {player.losses}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-300">
                            {getWinRatio(player)}%
                          </td>
                        </tr>
                      );
                    })}

                    {/* Pinned Out-of-Bounds User Row at the bottom of the table if not in top list */}
                    {outOfBoundsUser && !isSearching && (
                      <>
                        <tr className="border-t-2 border-dashed border-slate-700/60 bg-slate-900/60">
                          <td colSpan={6} className="py-2 text-center text-xs text-slate-500 italic">
                            ... and your current standing ...
                          </td>
                        </tr>
                        <tr className="bg-blue-600/20 font-bold border-t border-blue-500/30">
                          <td className="px-4 py-4 text-blue-400">
                            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white font-bold">
                              #{outOfBoundsUser.rank}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar player={outOfBoundsUser} className="h-8 w-8 text-xs" />
                              <span className="font-semibold text-blue-400">You</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-white">
                            {formatPoints(outOfBoundsUser.points)}
                          </td>
                          <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">
                            {outOfBoundsUser.wins}
                          </td>
                          <td className="hidden px-4 py-4 text-right text-slate-400 sm:table-cell">
                            {outOfBoundsUser.losses}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-300">
                            {getWinRatio(outOfBoundsUser)}%
                          </td>
                        </tr>
                      </>
                    )}


                    {tablePlayers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                          {isSearching
                            ? `No players match "${query}".`
                            : "No players found for this period yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </div>}
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;