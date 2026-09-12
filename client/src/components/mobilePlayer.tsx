import React, { useEffect, useState } from "react";
import { Shield, Trophy, User, X } from "lucide-react";

interface PlayerCardProps {
  myTargetCard: {
    name: string;
    club: string;
    nationality: string;
    league: string;
    position: string;
    age: number;
    shirtNum: number;
    imageUrl?: string;
  };
}

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col items-center bg-white/5 rounded-lg py-2">
    <span className="text-xs text-white/50">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

const PlayerCard: React.FC<PlayerCardProps> = ({ myTargetCard }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full max-w-sm flex justify-between items-center gap-3 rounded-xl bg-gradient-to-r from-[#3a1620] via-[#241119] to-[#120a10] border border-white/10 px-3 py-2.5 text-left active:scale-[0.98] transition-transform"
      >
        <div className="flex flex-row items-center gap-1.5">
          <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
            {myTargetCard.imageUrl ? (
              <img
                src={myTargetCard.imageUrl}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <User className="w-5 h-5 text-white/30" strokeWidth={1.5} />
            )}
          </div>
          <span className="text-white font-semibold text-sm truncate">
            {myTargetCard.name}
          </span>
        </div>
        <div className="text-white">Your Player Card</div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center sm:items-center justify-center p-5"
          onClick={() => setIsOpen(false)} // backdrop click closes
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-card-title"
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-[#3a1620] via-[#241119] to-[#120a10] border border-white/10 shadow-2xl"
          >
            {myTargetCard.imageUrl && (
              <img
                src={myTargetCard.imageUrl}
                alt={myTargetCard.name}
                className="absolute inset-0 w-full h-40 object-cover object-top opacity-40"
              />
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 text-white bg-white/20 hover:bg-white/30 rounded-full p-1.5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-[1] p-5 pt-16">
              <h2 id="player-card-title" className="text-white text-2xl font-bold mb-2">
                {myTargetCard.name}
              </h2>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>{myTargetCard.club} · {myTargetCard.nationality}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <Trophy className="w-4 h-4 shrink-0" />
                <span>League: {myTargetCard.league}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="POS" value={myTargetCard.position} />
                <Stat label="AGE" value={myTargetCard.age} />
                <Stat label="NO." value={myTargetCard.shirtNum} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerCard;