import Link from "next/link";
import type { GroupStandingsTable, TournamentStanding } from "@/types/tournament";

type Props = { tables: GroupStandingsTable[] };

const STATUS_COLOR: Record<TournamentStanding["status"], string> = {
  qualified:  "bg-emerald-500",
  eliminated: "bg-red-500",
  tbd:        "bg-zinc-300",
};

const STATUS_LABEL: Record<TournamentStanding["status"], string> = {
  qualified:  "Qualified",
  eliminated: "Eliminated",
  tbd:        "TBD",
};

export function GroupStandings({ tables }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {tables.map((table) => {
        const { group, rows } = table;
        return (
          <section
            key={group.letter}
            id={`group-${group.letter.toLowerCase()}`}
            className="rounded-sm border border-zinc-200 bg-white"
            aria-label={`Group ${group.letter}`}
          >
            <div className="border-b border-zinc-100 px-4 py-3">
              <h2 className="text-sm font-black tracking-tight">Group {group.letter}</h2>
            </div>

            <table className="w-full text-xs" aria-label={`Group ${group.letter} standings`}>
              <thead>
                <tr className="border-b border-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="py-1.5 pl-4 text-left font-semibold" scope="col">#</th>
                  <th className="py-1.5 text-left font-semibold" scope="col">Team</th>
                  <th className="py-1.5 pr-1 text-right font-semibold" scope="col">P</th>
                  <th className="py-1.5 pr-1 text-right font-semibold" scope="col">W</th>
                  <th className="py-1.5 pr-1 text-right font-semibold" scope="col">D</th>
                  <th className="py-1.5 pr-1 text-right font-semibold" scope="col">L</th>
                  <th className="py-1.5 pr-1 text-right font-semibold" scope="col">GD</th>
                  <th className="py-1.5 pr-4 text-right font-semibold" scope="col">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {rows.map((row) => (
                  <tr key={row.team.slug} className="hover:bg-zinc-50">
                    <td className="py-2.5 pl-4 text-zinc-400">{row.position}</td>
                    <td className="py-2.5">
                      <Link
                        href={`/world-cup/teams/${row.team.slug}`}
                        className="flex items-center gap-2 font-bold text-zinc-900 hover:text-emerald-800 focus-visible:outline-none"
                        title={STATUS_LABEL[row.status]}
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: STATUS_COLOR[row.status] }}
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
                    <td className="py-2.5 pr-4 text-right font-black text-zinc-900">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Legend */}
            <div className="flex gap-3 border-t border-zinc-50 px-4 py-2">
              {([["qualified","Qualified","bg-emerald-500"],["tbd","TBD","bg-zinc-300"]] as const).map(([, label, cls]) => (
                <span key={label} className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className={`h-1.5 w-1.5 rounded-full ${cls}`} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
