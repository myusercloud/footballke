import Link from "next/link";
import type { TournamentPlayer } from "@/types/tournament";

type Props = { players: TournamentPlayer[] };

const POSITION_SHORT: Record<string, string> = {
  Goalkeeper:  "GK",
  Defender:    "CB",
  Midfielder:  "MF",
  Forward:     "FW",
};

export function PlayerSpotlight({ players }: Props) {
  if (players.length === 0) return null;

  return (
    <section aria-label="Featured players">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-black tracking-tight">Players to Watch</h2>
        <span className="text-xs text-zinc-400">{players.length} featured</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {players.map((player) => (
          <article
            key={player.slug}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {/* Gradient header with jersey number */}
            <div
              className="relative h-20 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${player.team.colors.primary} 0%, ${player.team.colors.secondary} 100%)`,
              }}
            >
              {/* Huge jersey number ghost */}
              <span
                className="pointer-events-none absolute -right-1 -top-2 select-none text-[4.5rem] font-black leading-none text-white/20"
                aria-hidden="true"
              >
                {player.jerseyNumber}
              </span>

              {/* Position badge */}
              <div className="absolute bottom-2 left-3">
                <span className="rounded-md bg-black/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/90">
                  {POSITION_SHORT[player.position] ?? player.position}
                </span>
              </div>

              {/* Jersey number badge */}
              <div className="absolute right-3 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-black text-white ring-1 ring-white/30">
                {player.jerseyNumber}
              </div>
            </div>

            <div className="p-3">
              <Link
                href={`/world-cup/players/${player.slug}`}
                className="block text-xs font-black leading-snug text-zinc-900 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 after:absolute after:inset-0"
              >
                {player.name}
              </Link>
              <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
                {player.team.name}
              </p>

              {/* Stats bar */}
              <div className="mt-3 grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 pt-2.5 text-center">
                <div>
                  <p className="text-sm font-black text-zinc-900">{player.stats.goals}</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-400">G</p>
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-900">{player.stats.assists}</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-400">A</p>
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-900">{player.stats.appearances}</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-400">App</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
