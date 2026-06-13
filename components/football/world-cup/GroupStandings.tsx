import Link from "next/link";
import type { GroupStandingsTable, TournamentStanding } from "@/types/tournament";

type Props = { tables: GroupStandingsTable[] };

const STATUS_LABEL: Record<TournamentStanding["status"], string> = {
  qualified:  "Qualified for Round of 32",
  eliminated: "Eliminated",
  tbd:        "TBD",
};

function statusDot(status: TournamentStanding["status"], position: number) {
  if (status === "eliminated") return "bg-red-500";
  if (status === "qualified")  return "bg-emerald-500";
  return position <= 2 ? "bg-emerald-400/60" : "bg-zinc-300";
}

export function GroupStandings({ tables }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => {
        const { group, rows } = table;
        return (
          <section
            key={group.letter}
            id={`group-${group.letter.toLowerCase()}`}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            aria-label={`Group ${group.letter}`}
          >
            {/* Dark header */}
            <div className="flex items-center gap-3 bg-zinc-900 px-5 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                {group.letter}
              </span>
              <h2 className="text-sm font-black text-white">Group {group.letter}</h2>
              <span className="ml-auto text-xs text-zinc-500">
                {rows.filter(r => r.played > 0).length}/{rows.length} played
              </span>
            </div>

            <table className="w-full text-xs" aria-label={`Group ${group.letter} standings`}>
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="py-2 pl-5 text-left font-semibold" scope="col">#</th>
                  <th className="py-2 text-left font-semibold" scope="col">Team</th>
                  <th className="py-2 pr-1 text-right font-semibold" scope="col">P</th>
                  <th className="py-2 pr-1 text-right font-semibold" scope="col">W</th>
                  <th className="py-2 pr-1 text-right font-semibold" scope="col">D</th>
                  <th className="py-2 pr-1 text-right font-semibold" scope="col">L</th>
                  <th className="py-2 pr-1 text-right font-semibold" scope="col">GD</th>
                  <th className="py-2 pr-5 text-right font-semibold" scope="col">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {rows.map((row) => {
                  const isTop2 = row.position <= 2;
                  return (
                    <tr
                      key={row.team.slug}
                      className={isTop2 ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-zinc-50"}
                    >
                      <td className="py-2.5 pl-5">
                        <span className={`font-black ${isTop2 ? "text-emerald-600" : "text-zinc-300"}`}>
                          {row.position}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={`/world-cup/teams/${row.team.slug}`}
                          className="flex items-center gap-2 font-bold text-zinc-900 hover:text-emerald-700 focus-visible:outline-none"
                          title={STATUS_LABEL[row.status]}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${statusDot(row.status, row.position)}`}
                            aria-hidden="true"
                          />
                          {row.team.name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-1 text-right text-zinc-500">{row.played}</td>
                      <td className="py-2.5 pr-1 text-right text-zinc-500">{row.won}</td>
                      <td className="py-2.5 pr-1 text-right text-zinc-500">{row.drawn}</td>
                      <td className="py-2.5 pr-1 text-right text-zinc-500">{row.lost}</td>
                      <td className="py-2.5 pr-1 text-right text-zinc-500">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-2.5 pr-5 text-right font-black text-zinc-900">{row.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
