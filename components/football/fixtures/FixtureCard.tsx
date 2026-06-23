import Link from "next/link";
import type { Fixture } from "@/types/fixture";
import { TeamBadge } from "./TeamBadge";
import { MatchStatusBadge } from "./MatchStatus";
import { formatKickoffTime, formatKickoffShort } from "@/lib/fixture.utils";
import { slugifyVenue } from "@/lib/venue.utils";

type Props = {
  fixture: Fixture;
};

export function FixtureCard({ fixture }: Props) {
  const {
    homeTeam,
    awayTeam,
    score,
    status,
    liveMinute,
    kickoff,
    competition,
    venue,
    matchday,
    goalEvents,
  } = fixture;

  const hasScore = score !== undefined;
  const isScheduled = status === "scheduled";

  // Compact goal line for fulltime cards, e.g. "Kipkirui 23' | Otieno 67'"
  const homeGoalLine = goalEvents
    .filter((e) => e.team === 'home')
    .sort((a, b) => a.minute - b.minute)
    .map((e) => `${e.playerName.split(' ').at(-1)} ${e.minute}${e.addedTime ? '+' + e.addedTime : ''}'`)
    .join(', ');
  const awayGoalLine = goalEvents
    .filter((e) => e.team === 'away')
    .sort((a, b) => a.minute - b.minute)
    .map((e) => `${e.playerName.split(' ').at(-1)} ${e.minute}${e.addedTime ? '+' + e.addedTime : ''}'`)
    .join(', ');
  const showGoalLine = status === 'fulltime' && goalEvents.length > 0;

  return (
    <article className="group relative rounded-sm border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          {competition.name}
          {matchday != null ? ` · MW${matchday}` : ""}
        </span>
        <MatchStatusBadge status={status} liveMinute={liveMinute} />
      </div>

      {/* ── Teams + score ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Home */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <TeamBadge team={homeTeam} size="sm" />
          <Link
            href={`/clubs/${homeTeam.slug}`}
            className="relative z-10 truncate text-sm font-bold hover:text-emerald-700 focus:outline-none focus-visible:underline"
          >
            {homeTeam.shortName}
          </Link>
        </div>

        {/* Score / time — tabular-nums keeps digits stable as score changes */}
        <div className="flex shrink-0 flex-col items-center">
          {hasScore ? (
            <>
              <span
                className="min-w-[3.5rem] text-center text-lg font-black tabular-nums"
                aria-label={`${score.home} – ${score.away}`}
              >
                {score.home}
                <span className="mx-0.5 text-zinc-300" aria-hidden="true">
                  —
                </span>
                {score.away}
              </span>
              {score.halfTime && status === "fulltime" && (
                <span className="text-[9px] font-semibold text-zinc-400">
                  HT {score.halfTime.home}–{score.halfTime.away}
                </span>
              )}
            </>
          ) : (
            <span className="min-w-[3.5rem] text-center text-sm font-bold text-zinc-500">
              {formatKickoffTime(kickoff)}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
          <Link
            href={`/clubs/${awayTeam.slug}`}
            className="relative z-10 truncate text-right text-sm font-bold hover:text-emerald-700 focus:outline-none focus-visible:underline"
          >
            {awayTeam.shortName}
          </Link>
          <TeamBadge team={awayTeam} size="sm" />
        </div>
      </div>

      {/* ── Compact goal scorers line (fulltime only) ─────────────────────── */}
      {showGoalLine && (
        <div className="border-t border-zinc-100 px-4 py-1 text-[10px] text-zinc-400">
          <span>{homeGoalLine}</span>
          {homeGoalLine && awayGoalLine && <span className="mx-1 text-zinc-200">|</span>}
          <span>{awayGoalLine}</span>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-1.5">
        {venue.name ? (
          <Link
            href={`/venues/${slugifyVenue(venue.name)}`}
            className="relative z-10 truncate text-[10px] text-zinc-400 hover:text-zinc-600 hover:underline focus:outline-none focus-visible:underline"
          >
            {venue.name}{venue.city ? ` · ${venue.city}` : ""}
          </Link>
        ) : (
          <span className="truncate text-[10px] text-zinc-400">
            {venue.city}
          </span>
        )}
        {isScheduled && (
          <span className="ml-2 shrink-0 text-[10px] font-semibold text-zinc-400">
            {formatKickoffShort(kickoff)}
          </span>
        )}
      </div>

      {/* Full-card link — sits behind content via after:, nothing else needed */}
      <Link
        href={`/fixtures/${fixture.id}`}
        className="focus:outline-none after:absolute after:inset-0"
        aria-label={`${homeTeam.name} vs ${awayTeam.name} — match details`}
      />
    </article>
  );
}
