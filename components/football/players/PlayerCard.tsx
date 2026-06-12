import Link from "next/link";
import type { Player } from "@/types/player";

type Props = { player: Player; clubColor?: string };

const POSITION_SHORT: Record<string, string> = {
  "Goalkeeper":           "GK",
  "Centre-Back":          "CB",
  "Left-Back":            "LB",
  "Right-Back":           "RB",
  "Wing-Back":            "WB",
  "Defensive Midfielder": "DM",
  "Central Midfielder":   "CM",
  "Attacking Midfielder": "AM",
  "Left Midfielder":      "LM",
  "Right Midfielder":     "RM",
  "Striker":              "ST",
  "Second Striker":       "SS",
  "Left Winger":          "LW",
  "Right Winger":         "RW",
};

export function PlayerCard({ player, clubColor = "#006B2D" }: Props) {
  return (
    <article className="relative rounded-sm border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      {/* Color accent */}
      <div className="h-1 rounded-t-sm" style={{ backgroundColor: clubColor }} aria-hidden="true" />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
            style={{ backgroundColor: clubColor }}
            aria-hidden="true"
          >
            {player.jerseyNumber}
          </div>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {POSITION_SHORT[player.position] ?? player.position}
          </span>
        </div>

        {/* Name */}
        <Link
          href={`/players/${player.slug}`}
          className="mt-2 block text-sm font-black leading-tight text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 after:absolute after:inset-0"
        >
          {player.name}
        </Link>
        <p className="mt-0.5 text-[11px] text-zinc-500">{player.clubName}</p>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 border-t border-zinc-50 pt-3 text-center">
          <div>
            <p className="text-base font-black text-zinc-900">{player.stats.goals}</p>
            <p className="text-[10px] uppercase text-zinc-400">G</p>
          </div>
          <div>
            <p className="text-base font-black text-zinc-900">{player.stats.assists}</p>
            <p className="text-[10px] uppercase text-zinc-400">A</p>
          </div>
          <div className="ml-auto text-[11px] text-zinc-400">{player.nationality.code}</div>
        </div>
      </div>
    </article>
  );
}
