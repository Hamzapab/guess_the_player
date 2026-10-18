
export interface Player {
  id: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
  avatar: string | null;
}
type PodiumRank = 1 | 2 | 3;

export interface RankedPlayer extends Player {
  rank: number;
}

interface PodiumCardProps {
  player: RankedPlayer;
  rank: PodiumRank;
}
interface PodiumStyle {
  badge: string;
  ring: string;
  label: string;
}

const formatPoints = (n: number): string => n.toLocaleString("en-US");


const PODIUM_STYLES: Record<PodiumRank, PodiumStyle> = {
  1: { badge: "bg-yellow-500/20 text-yellow-300", ring: "border-yellow-400", label: "1ST" },
  2: { badge: "bg-slate-500/30 text-slate-300", ring: "border-slate-400", label: "2ND" },
  3: { badge: "bg-orange-500/20 text-orange-400", ring: "border-orange-500", label: "3RD" },
};

export const PodiumCard = ({ player, rank }: PodiumCardProps) => {
  const isFirst = rank === 1;
  const style = PODIUM_STYLES[rank];

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border bg-slate-800/60 px-4 pb-4 ${
        isFirst
          ? "border-yellow-500/40 pt-8 shadow-lg shadow-yellow-500/5 sm:pb-6 sm:pt-10"
          : "border-slate-700/60 pt-6"
      }`}
    >
      {isFirst && (
        <span className="absolute -top-4 text-2xl" aria-hidden="true">
          🏆
        </span>
      )}

      <span
        className={`mb-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${style.badge}`}
      >
        {style.label}
      </span>

      <Avatar
        player={player}
        className={`border-2 ${style.ring} ${isFirst ? "h-20 w-20 text-xl" : "h-16 w-16"}`}
      />

      <h3 className={`mt-3 font-bold text-white ${isFirst ? "text-xl" : "text-base"}`}>
        {player.name}
      </h3>
      <p className="text-sm font-semibold text-blue-400">{formatPoints(player.points)} pts</p>

      <div className="mt-4 flex w-full justify-between rounded-lg bg-slate-900/60 px-3 py-2 text-xs">
        <span className={isFirst ? "font-semibold text-green-400" : "text-slate-400"}>
          {player.wins} W
        </span>
        <span className="text-slate-400">{player.losses} L</span>
      </div>
    </div>
  );
};

 /* ---------- component ---------- */
interface AvatarProps {
  player: Pick<Player, "name" | "avatar">;
  className?: string;
}

export const Avatar = ({ player, className = "" }: AvatarProps) => {
  if (player.avatar) {
    return (
      <img
        src={player.avatar}
        alt={player.name}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  // Fallback 
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-slate-700 font-bold text-slate-200 ${className}`}
      aria-label={player.name}
    >
      {player.name.slice(0, 2).toUpperCase()}
    </div>
  );
};