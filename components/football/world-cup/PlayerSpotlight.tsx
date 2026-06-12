import Link from "next/link";
import type { TournamentPlayer } from "@/types/tournament";

type Props = { players: TournamentPlayer[] };

export function PlayerSpotlight({ players }: Props) {
  if (players.length === 0) return null;

  return (
    <section aria-label="Featured players">
      <h2 className="mb-4 text-lg font-black tracking-tight">Players to Watch</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {players.map((player) => (
          <article
            key={player.slug}
            className="relative rounded-sm border border-zinc-200 bg-white transition-shadow hover:shadow-md"
          >
            {/* Color top strip */}
            <div
              className="h-1 rounded-t-sm"
              style={{ backgroundColor: player.team.colors.primary }}
              aria-hidden="true"
            />
            <div className="p-3">
              {/* Jersey number circle */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ backgroundColor: player.team.colors.primary }}
                aria-hidden="true"
              >
                {player.jerseyNumber}
              </div>

              <Link
                href={`/world-cup/players/${player.slug}`}
                className="mt-2 block text-xs font-black leading-tight text-zinc-900 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 after:absolute after:inset-0"
              >
                {player.name}
              </Link>
              <p className="mt-0.5 text-[10px] text-zinc-500">{player.team.name}</p>

              <div className="mt-2 flex gap-2 border-t border-zinc-50 pt-2">
                <span className="text-xs font-black text-zinc-900">{player.stats.goals}G</span>
                <span className="text-xs font-black text-zinc-400">{player.stats.assists}A</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
