import Link from "next/link";
import type { Player } from "@/types/player";

type Props = { player: Player };

export function PlayerPreviewCard({ player }: Props) {
  return (
    <li className="group relative flex items-center gap-3 rounded-sm px-3 py-2 transition-colors hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-600">
      {/* Jersey number */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-600">
        {player.jerseyNumber}
      </span>

      {/* Name + position */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight">
          <Link
            href={`/players/${player.slug}`}
            className="focus:outline-none after:absolute after:inset-0"
          >
            {player.name}
          </Link>
        </p>
        <p className="text-[11px] text-zinc-400">{player.position}</p>
      </div>

      {/* Nationality flag + stats */}
      <div className="flex shrink-0 items-center gap-3 text-right">
        <div className="hidden sm:block">
          <p className="text-[10px] text-zinc-400">G / A</p>
          <p className="text-xs font-black text-zinc-700">
            {player.stats.goals} / {player.stats.assists}
          </p>
        </div>
        <span className="text-xs text-zinc-400" title={player.nationality.name}>
          {player.nationality.code}
        </span>
      </div>
    </li>
  );
}
