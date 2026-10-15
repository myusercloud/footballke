import Link from "next/link";
import type { Fixture } from "@/types/fixture";

type Props = {
  fixtures: Fixture[];
};

function isLive(fixture: Fixture): boolean {
  return fixture.status === "live" || fixture.status === "halftime";
}

function statusLabel(fixture: Fixture): string {
  if (fixture.status === "live")
    return fixture.liveMinute ? `${fixture.liveMinute}'` : "LIVE";
  if (fixture.status === "halftime") return "HT";
  return "FT";
}

export default function LiveTicker({ fixtures }: Props) {
  if (fixtures.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-zinc-200 bg-emerald-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-0 px-4 sm:px-6 lg:px-8">
        <span className="mr-3 shrink-0 border-r border-emerald-700 py-2 pr-3 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
          Live
        </span>
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap py-2 text-xs font-semibold text-emerald-100 scrollbar-none">
          {fixtures.map((fixture) => {
            const live = isLive(fixture);
            return (
              <Link
                key={fixture.id}
                href={`/fixtures/${fixture.id}`}
                className="flex shrink-0 items-center gap-2 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
              >
                {live && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300"
                    aria-hidden="true"
                  />
                )}
                <span className="font-bold">{fixture.homeTeam.abbreviation}</span>
                {fixture.score ? (
                  <span className="font-black tabular-nums text-white">
                    {fixture.score.home}–{fixture.score.away}
                  </span>
                ) : (
                  <span className="text-emerald-300">vs</span>
                )}
                <span className="font-bold">{fixture.awayTeam.abbreviation}</span>
                <span className="text-emerald-300">· {statusLabel(fixture)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
