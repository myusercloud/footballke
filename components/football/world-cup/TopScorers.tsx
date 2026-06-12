import Link from "next/link";
import type { TopScorer } from "@/types/tournament";

type Props = { scorers: TopScorer[]; limit?: number };

export function TopScorers({ scorers, limit }: Props) {
  const shown = limit ? scorers.slice(0, limit) : scorers;

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Top scorers"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Top Scorers</h2>
      </div>

      {shown.length === 0 ? (
        <p className="px-5 py-6 text-sm text-zinc-400">No scoring data yet.</p>
      ) : (
        <ol className="divide-y divide-zinc-50">
          {shown.map((scorer) => (
            <li key={scorer.playerSlug}>
              <Link
                href={`/world-cup/teams/${scorer.team.slug}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
              >
                {/* Rank */}
                <span className="w-5 shrink-0 text-right text-xs font-black text-zinc-300">
                  {scorer.rank}
                </span>

                {/* Flag */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: scorer.team.colors.primary }}
                  aria-hidden="true"
                >
                  {scorer.team.abbreviation.slice(0, 2)}
                </span>

                {/* Name + team */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-900">{scorer.playerName}</p>
                  <p className="text-[11px] text-zinc-400">{scorer.team.name}</p>
                </div>

                {/* Goals */}
                <div className="flex items-center gap-3 text-right shrink-0">
                  <div>
                    <p className="text-lg font-black text-zinc-900">{scorer.goals}</p>
                    <p className="text-[10px] uppercase text-zinc-400">G</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-zinc-400">{scorer.assists}</p>
                    <p className="text-[10px] uppercase text-zinc-400">A</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
