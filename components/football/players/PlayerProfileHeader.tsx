import Link from "next/link";
import type { Player } from "@/types/player";

type Props = { player: Player; clubColor?: string };

export function PlayerProfileHeader({ player, clubColor = "#006B2D" }: Props) {
  return (
    <header
      className="relative overflow-hidden rounded-sm"
      style={{ backgroundColor: clubColor }}
    >
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Photo placeholder */}
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/20 text-3xl font-black text-white/50"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            aria-hidden="true"
          >
            {player.jerseyNumber}
          </div>

          {/* Identity */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/20 text-xs font-black">
                {player.jerseyNumber}
              </span>
              <span className="text-xs text-white/60">{player.position}</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              {player.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              <Link
                href={`/clubs/${player.clubSlug}`}
                className="font-semibold text-white/90 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {player.clubName}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{player.nationality.name}</span>
            </div>
          </div>

          {/* Season goals */}
          <div className="text-right text-white">
            <p className="text-xs text-white/60">This Season</p>
            <p className="text-4xl font-black">{player.stats.goals}</p>
            <p className="text-xs text-white/60">goals</p>
          </div>
        </div>
      </div>
    </header>
  );
}
