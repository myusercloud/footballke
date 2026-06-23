import Link from "next/link";
import type { Fixture } from "@/types/fixture";
import { TeamBadge } from "./TeamBadge";
import { MatchStatusBadge } from "./MatchStatus";
import { formatKickoffTime } from "@/lib/fixture.utils";

type Props = {
  fixture: Fixture;
};

// ScoreBoard is the full-size shared display: team badges, names, score/vs,
// status badge, and HT footnote. Used by FeaturedFixture and MatchHeader.
// FixtureCard renders its own compact inline layout.
export function ScoreBoard({ fixture }: Props) {
  const { homeTeam, awayTeam, score, status, liveMinute, kickoff } = fixture;
  const hasScore = score !== undefined;

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {/* Home */}
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <Link href={`/clubs/${homeTeam.slug}`} aria-label={homeTeam.name}>
          <TeamBadge team={homeTeam} size="lg" />
        </Link>
        <Link
          href={`/clubs/${homeTeam.slug}`}
          className="text-sm font-black leading-tight tracking-tight hover:text-emerald-700 focus:outline-none focus-visible:underline sm:text-base"
        >
          {homeTeam.shortName}
        </Link>
      </div>

      {/* Centre — score or kickoff time */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        {hasScore ? (
          <>
            <p
              className="text-4xl font-black tabular-nums tracking-tight sm:text-5xl"
              aria-label={`${score.home} – ${score.away}`}
            >
              {score.home}
              <span className="mx-1 text-zinc-300" aria-hidden="true">
                —
              </span>
              {score.away}
            </p>
            {score.halfTime && status === "fulltime" && (
              <p className="text-[10px] font-semibold text-zinc-400">
                HT {score.halfTime.home} – {score.halfTime.away}
              </p>
            )}
          </>
        ) : (
          <p
            className="text-3xl font-black text-zinc-200 sm:text-4xl"
            aria-label="kick off time"
          >
            {formatKickoffTime(kickoff)}
          </p>
        )}
        <MatchStatusBadge status={status} liveMinute={liveMinute} />
      </div>

      {/* Away */}
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <Link href={`/clubs/${awayTeam.slug}`} aria-label={awayTeam.name}>
          <TeamBadge team={awayTeam} size="lg" />
        </Link>
        <Link
          href={`/clubs/${awayTeam.slug}`}
          className="text-sm font-black leading-tight tracking-tight hover:text-emerald-700 focus:outline-none focus-visible:underline sm:text-base"
        >
          {awayTeam.shortName}
        </Link>
      </div>
    </div>
  );
}
