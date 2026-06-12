import Link from "next/link";
import type { GroupStandingsTable, TournamentStanding } from "@/types/tournament";

type Props = { table: GroupStandingsTable };

const STATUS_COLOR: Record<TournamentStanding["status"], string> = {
  qualified:  "bg-emerald-500",
  eliminated: "bg-red-500",
  tbd:        "bg-zinc-300",
};

export function GroupCard({ table }: Props) {
  const { group, rows } = table;

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label={`Group ${group.letter}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-black tracking-tight">Group {group.letter}</h2>
        <Link
          href={`/world-cup/groups#group-${group.letter.toLowerCase()}`}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Full table →
        </Link>
      </div>

      <table className="w-full text-xs" aria-label={`Group ${group.letter} standings`}>
        <thead>
          <tr className="border-b border-zinc-50 text-[10px] uppercase tracking-wider text-zinc-400">
            <th className="py-1.5 pl-4 text-left font-semibold" scope="col">#</th>
            <th className="py-1.5 text-left font-semibold" scope="col">Team</th>
            <th className="py-1.5 pr-2 text-right font-semibold" scope="col">P</th>
            <th className="py-1.5 pr-2 text-right font-semibold" scope="col">GD</th>
            <th className="py-1.5 pr-4 text-right font-semibold" scope="col">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row) => (
            <tr key={row.team.slug} className="hover:bg-zinc-50">
              <td className="py-2 pl-4 text-zinc-400">{row.position}</td>
              <td className="py-2">
                <Link
                  href={`/world-cup/teams/${row.team.slug}`}
                  className="flex items-center gap-2 font-semibold text-zinc-900 hover:text-emerald-800 focus-visible:outline-none"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[row.status] }}
                    title={row.status}
                    aria-hidden="true"
                  />
                  {row.team.abbreviation}
                </Link>
              </td>
              <td className="py-2 pr-2 text-right text-zinc-600">{row.played}</td>
              <td className="py-2 pr-2 text-right text-zinc-600">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="py-2 pr-4 text-right font-black text-zinc-900">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
