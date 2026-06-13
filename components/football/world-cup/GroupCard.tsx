import Link from "next/link";
import type { GroupStandingsTable } from "@/types/tournament";

type Props = { table: GroupStandingsTable };

export function GroupCard({ table }: Props) {
  const { group, rows } = table;

  return (
    <section
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
      aria-label={`Group ${group.letter}`}
    >
      {/* Dark header */}
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
            {group.letter}
          </span>
          <h2 className="text-sm font-black text-white">Group {group.letter}</h2>
        </div>
        <Link
          href={`/world-cup/groups#group-${group.letter.toLowerCase()}`}
          className="text-xs font-semibold text-zinc-400 transition-colors hover:text-white focus-visible:outline-none"
        >
          Full →
        </Link>
      </div>

      <table className="w-full text-xs" aria-label={`Group ${group.letter} standings`}>
        <thead>
          <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400">
            <th className="py-2 pl-4 text-left font-semibold" scope="col">#</th>
            <th className="py-2 text-left font-semibold" scope="col">Team</th>
            <th className="py-2 pr-2 text-right font-semibold" scope="col">P</th>
            <th className="py-2 pr-2 text-right font-semibold" scope="col">GD</th>
            <th className="py-2 pr-4 text-right font-semibold" scope="col">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {rows.map((row) => {
            const isTop2 = row.position <= 2;
            return (
              <tr
                key={row.team.slug}
                className={isTop2 ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-zinc-50"}
              >
                <td className="py-2.5 pl-4">
                  <span className={`font-black ${isTop2 ? "text-emerald-600" : "text-zinc-300"}`}>
                    {row.position}
                  </span>
                </td>
                <td className="py-2.5">
                  <Link
                    href={`/world-cup/teams/${row.team.slug}`}
                    className="flex items-center gap-2 font-bold text-zinc-900 hover:text-emerald-700 focus-visible:outline-none"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: row.team.colors.primary }}
                      aria-hidden="true"
                    />
                    {row.team.abbreviation}
                  </Link>
                </td>
                <td className="py-2.5 pr-2 text-right text-zinc-500">{row.played}</td>
                <td className="py-2.5 pr-2 text-right text-zinc-500">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="py-2.5 pr-4 text-right font-black text-zinc-900">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
