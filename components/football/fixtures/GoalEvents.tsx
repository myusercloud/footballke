import Link from "next/link";
import type { GoalEvent, Team } from "@/types/fixture";

type Props = {
  homeTeam: Team;
  awayTeam: Team;
  goalEvents: GoalEvent[];
};

function minuteLabel(minute: number, addedTime?: number): string {
  return addedTime ? `${minute}+${addedTime}'` : `${minute}'`;
}

function EventRow({ event }: { event: GoalEvent }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <span className="w-10 shrink-0 text-right text-[11px] font-black tabular-nums text-zinc-400">
        {minuteLabel(event.minute, event.addedTime)}
      </span>
      <Link
        href={`/players/${event.playerSlug}`}
        className="truncate text-sm font-semibold text-zinc-800 hover:text-emerald-700 focus:outline-none focus-visible:underline"
      >
        {event.playerName}
      </Link>
      {event.isOwnGoal && (
        <span className="shrink-0 rounded bg-red-100 px-1 text-[9px] font-black uppercase tracking-wide text-red-600">
          OG
        </span>
      )}
      {event.isPenalty && (
        <span className="shrink-0 rounded bg-zinc-100 px-1 text-[9px] font-black uppercase tracking-wide text-zinc-500">
          P
        </span>
      )}
    </div>
  );
}

export function GoalEvents({ homeTeam, awayTeam, goalEvents }: Props) {
  if (goalEvents.length === 0) return null;

  const homeGoals = goalEvents
    .filter((e) => e.team === 'home')
    .sort((a, b) => a.minute - b.minute || (a.addedTime ?? 0) - (b.addedTime ?? 0));

  const awayGoals = goalEvents
    .filter((e) => e.team === 'away')
    .sort((a, b) => a.minute - b.minute || (a.addedTime ?? 0) - (b.addedTime ?? 0));

  return (
    <section
      aria-label="Goal scorers"
      className="mt-7 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
        Goals
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Home side */}
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
            {homeTeam.shortName}
          </p>
          {homeGoals.length > 0 ? (
            <div className="space-y-0.5">
              {homeGoals.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-300">—</p>
          )}
        </div>

        {/* Away side */}
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
            {awayTeam.shortName}
          </p>
          {awayGoals.length > 0 ? (
            <div className="space-y-0.5">
              {awayGoals.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-300">—</p>
          )}
        </div>
      </div>
    </section>
  );
}
