import Link from "next/link";
import type { Fixture } from "@/types/fixture";

type Props = {
  fixtures: Fixture[];
  clubSlug: string;
};

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Upcoming",
  fulltime:  "FT",
  live:      "LIVE",
  halftime:  "HT",
  postponed: "PPD",
};

export function ClubFixturesPreview({ fixtures, clubSlug }: Props) {
  if (fixtures.length === 0) {
    return (
      <section className="rounded-sm border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-sm font-black tracking-tight">Fixtures</h2>
        </div>
        <p className="px-5 py-6 text-sm text-zinc-400">No fixtures scheduled.</p>
      </section>
    );
  }

  const shown = fixtures.slice(0, 5);

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Club fixtures"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Fixtures</h2>
        <Link
          href={`/fixtures?teamSlug=${clubSlug}`}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          All fixtures →
        </Link>
      </div>

      <ul className="divide-y divide-zinc-50">
        {shown.map((fixture) => {
          const isHome = fixture.homeTeam.slug === clubSlug;
          const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
          const isCompleted = fixture.status === "fulltime";

          return (
            <li key={fixture.id}>
              <Link
                href={`/fixtures/${fixture.id}`}
                className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
              >
                {/* Date / Status */}
                <div className="w-16 shrink-0 text-[11px] text-zinc-400">
                  {isCompleted ? (
                    <span className="font-semibold text-zinc-500">FT</span>
                  ) : fixture.status === "live" ? (
                    <span className="font-black text-red-500">LIVE</span>
                  ) : (
                    formatKickoff(fixture.kickoff)
                  )}
                </div>

                {/* H/A badge */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-black bg-zinc-100 text-zinc-600">
                  {isHome ? "H" : "A"}
                </span>

                {/* Opponent */}
                <span className="flex-1 truncate font-semibold text-zinc-800">
                  vs {opponent.shortName}
                </span>

                {/* Score or status */}
                {isCompleted && fixture.score ? (
                  <span className="shrink-0 font-black text-zinc-900">
                    {isHome
                      ? `${fixture.score.home}–${fixture.score.away}`
                      : `${fixture.score.away}–${fixture.score.home}`}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-zinc-400">
                    {STATUS_LABEL[fixture.status] ?? fixture.status}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
