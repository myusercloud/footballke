import Link from "next/link";
import type { Fixture } from "@/types/fixture";
import { ScoreBoard } from "./ScoreBoard";
import { FormBadges } from "./FormBadges";
import { formatKickoffFull, formatKickoffTime } from "@/lib/fixture.utils";
import { slugifyVenue } from "@/lib/venue.utils";

type Props = {
  fixture: Fixture;
};

export function MatchHeader({ fixture }: Props) {
  const {
    competition,
    venue,
    matchday,
    kickoff,
    homeTeam,
    awayTeam,
    homeForm,
    awayForm,
    status,
  } = fixture;

  const isLiveOrPlayed = status === "live" || status === "halftime" || status === "fulltime";

  return (
    <header className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
      {/* ── Competition + venue strip ─────────────────────────────────────── */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
              {competition.name}
              {matchday != null ? ` · Matchday ${matchday}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {venue.name ? (
                <Link
                  href={`/venues/${slugifyVenue(venue.name)}`}
                  className="hover:text-emerald-700 hover:underline focus:outline-none focus-visible:underline"
                >
                  {venue.name}
                </Link>
              ) : null}
              {venue.city ? `, ${venue.city}` : ""}
              {venue.capacity != null
                ? ` · ${venue.capacity.toLocaleString()} capacity`
                : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-zinc-700">
              {formatKickoffFull(kickoff)}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400">
              {formatKickoffTime(kickoff)} EAT
            </p>
          </div>
        </div>
      </div>

      {/* ── Score board ───────────────────────────────────────────────────── */}
      <div className="px-5 py-8 sm:px-7">
        <ScoreBoard fixture={fixture} />

        {/* Form row — symmetrically positioned under each team */}
        {isLiveOrPlayed && (
          <div className="mt-5 flex items-start justify-between gap-4 border-t border-zinc-100 pt-5 sm:px-6">
            <div className="flex flex-1 flex-col items-center gap-1">
              <Link
                href={`/clubs/${homeTeam.slug}`}
                className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                {homeTeam.shortName} form
              </Link>
              <FormBadges
                form={homeForm}
                label={`${homeTeam.shortName} recent form`}
              />
            </div>
            <div className="shrink-0" aria-hidden="true" />
            <div className="flex flex-1 flex-col items-center gap-1">
              <Link
                href={`/clubs/${awayTeam.slug}`}
                className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                {awayTeam.shortName} form
              </Link>
              <FormBadges
                form={awayForm}
                label={`${awayTeam.shortName} recent form`}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
