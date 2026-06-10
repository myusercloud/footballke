import Link from "next/link";
import type { Fixture } from "@/types/fixture";
import { ScoreBoard } from "./ScoreBoard";
import { FormBadges } from "./FormBadges";
import { MatchStatusBadge } from "./MatchStatus";
import { formatMatchDateLabel, formatKickoffTime } from "@/lib/fixture.utils";

type Props = {
  fixture: Fixture;
};

export function FeaturedFixture({ fixture }: Props) {
  const {
    competition,
    venue,
    matchday,
    kickoff,
    status,
    liveMinute,
    homeTeam,
    awayTeam,
    homeForm,
    awayForm,
    preview,
  } = fixture;

  return (
    <article className="group relative overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600">
      {/* ── Header strip ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-2.5 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
            Featured
          </span>
          <span className="text-zinc-300" aria-hidden="true">·</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {competition.name}
            {matchday != null ? ` · MW${matchday}` : ""}
          </span>
        </div>
        <MatchStatusBadge status={status} liveMinute={liveMinute} />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 sm:px-7">
        {/* Date + time */}
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
          {formatMatchDateLabel(kickoff)}
          <span className="mx-1.5 text-zinc-300" aria-hidden="true">·</span>
          {formatKickoffTime(kickoff)}
        </p>

        {/* Score board */}
        <div className="mt-5">
          <ScoreBoard fixture={fixture} />
        </div>

        {/* Form row — positioned symmetrically under each team */}
        <div className="mt-3 flex items-start justify-between gap-4 px-4 sm:px-8">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Form
            </span>
            <FormBadges
              form={homeForm}
              label={`${homeTeam.shortName} recent form`}
              size="sm"
            />
          </div>
          <div className="shrink-0" aria-hidden="true" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
              Form
            </span>
            <FormBadges
              form={awayForm}
              label={`${awayTeam.shortName} recent form`}
              size="sm"
            />
          </div>
        </div>

        {/* Venue */}
        <p className="mt-4 text-center text-xs text-zinc-400">
          {venue.name}
          {venue.city ? `, ${venue.city}` : ""}
        </p>

        {/* Preview text */}
        {preview && (
          <p className="mt-4 border-t border-zinc-100 pt-4 text-sm leading-6 text-zinc-600">
            {preview}
          </p>
        )}

        {/* CTA — uses relative z-10 to sit above the after: overlay */}
        <div className="relative z-10 mt-5 flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition-colors group-hover:text-emerald-600">
            Match details
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Full-card link */}
      <Link
        href={`/fixtures/${fixture.id}`}
        className="focus:outline-none after:absolute after:inset-0"
        aria-label={`${homeTeam.name} vs ${awayTeam.name} — match details`}
      />
    </article>
  );
}
