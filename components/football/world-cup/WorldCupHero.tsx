import Link from "next/link";
import type { Tournament } from "@/types/tournament";

type Props = { tournament: Tournament };

const PHASE_LABEL: Record<string, string> = {
  "group":         "Group Stage",
  "round-of-16":   "Round of 16",
  "quarter-final": "Quarter-Finals",
  "semi-final":    "Semi-Finals",
  "final":         "Final",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function WorldCupHero({ tournament }: Props) {
  const phase = PHASE_LABEL[tournament.currentPhase] ?? tournament.currentPhase;

  return (
    <header className="relative overflow-hidden rounded-sm bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-900">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-lime-400/10" aria-hidden="true" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        {/* Phase badge */}
        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
          {phase} · Live
        </span>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          {tournament.shortName}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          {formatDate(tournament.dates.start)} – {formatDate(tournament.dates.end)}
          {" · "}
          {tournament.host.countries.join(", ")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/world-cup/fixtures"
            className="inline-flex items-center rounded-sm bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            View Fixtures →
          </Link>
          <Link
            href="/world-cup/groups"
            className="inline-flex items-center rounded-sm border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Group Tables
          </Link>
        </div>
      </div>
    </header>
  );
}
