import type { KnockoutRound } from "@/types/tournament";

type Props = { rounds: KnockoutRound[] };

const STAGE_LABEL: Record<string, string> = {
  "round-of-16":   "Round of 16",
  "quarter-final": "Quarter-Finals",
  "semi-final":    "Semi-Finals",
  "final":         "Final",
};

export function KnockoutPreview({ rounds }: Props) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-sm border border-zinc-200 bg-white px-5 py-8 text-center">
        <p className="text-sm text-zinc-400">Knockout stage brackets will appear here once the group stage is complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <section key={round.stage} aria-label={STAGE_LABEL[round.stage]}>
          <h3 className="mb-3 text-sm font-black tracking-tight">{STAGE_LABEL[round.stage] ?? round.stage}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {round.matches.map((match) => (
              <div
                key={match.id}
                className="rounded-sm border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                {match.label && (
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-400">{match.label}</p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-bold ${match.team1 ? "text-zinc-900" : "text-zinc-400"}`}>
                    {match.team1 ? match.team1.abbreviation : "TBD"}
                  </span>
                  <span className="text-xs font-black text-zinc-400">vs</span>
                  <span className={`font-bold ${match.team2 ? "text-zinc-900" : "text-zinc-400"}`}>
                    {match.team2 ? match.team2.abbreviation : "TBD"}
                  </span>
                </div>
                {match.kickoff && (
                  <p className="mt-1 text-[10px] text-zinc-400">
                    {new Date(match.kickoff).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    {match.venue && ` · ${match.venue}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
