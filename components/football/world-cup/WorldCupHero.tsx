import Link from "next/link";
import type { Tournament } from "@/types/tournament";

type Props = { tournament: Tournament };

const PHASE_LABEL: Record<string, string> = {
  group:           "Group Stage",
  "round-of-16":   "Round of 16",
  "quarter-final": "Quarter-Finals",
  "semi-final":    "Semi-Finals",
  final:           "Final",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function WorldCupHero({ tournament }: Props) {
  const phase = PHASE_LABEL[tournament.currentPhase] ?? tournament.currentPhase;

  const stats = [
    { value: tournament.totalTeams, label: "Nations" },
    { value: tournament.groups.length, label: "Groups" },
    { value: tournament.host.venues.length, label: "Venues" },
    { value: tournament.host.countries.length, label: "Hosts" },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl bg-zinc-950">
      {/* Ghosted "2026" background text */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="select-none pr-4 font-black leading-none text-white opacity-[0.04]"
          style={{ fontSize: "clamp(8rem, 20vw, 18rem)" }}
        >
          2026
        </span>
      </div>

      {/* Diagonal gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        {/* Phase badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 ring-1 ring-emerald-500/30">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
            {phase} · Live
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          World Cup<br />
          <span className="text-emerald-400">2026</span>
        </h1>

        <p className="mt-3 text-sm font-medium text-zinc-400">
          {formatDate(tournament.dates.start)} – {formatDate(tournament.dates.end)}
          {" · "}
          {tournament.host.countries.join(" · ")}
        </p>

        {/* Stats strip */}
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-black tabular-nums text-white">{value}</p>
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">{label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/world-cup/fixtures"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Fixtures →
          </Link>
          <Link
            href="/world-cup/groups"
            className="inline-flex items-center rounded-xl border border-zinc-700 px-6 py-3 text-sm font-bold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Group Tables
          </Link>
        </div>
      </div>
    </header>
  );
}
