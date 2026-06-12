import type { Club } from "@/types/club";

type Props = { club: Club };

const FORM_COLORS: Record<string, string> = {
  W: "bg-emerald-600 text-white",
  D: "bg-amber-400 text-zinc-900",
  L: "bg-red-500 text-white",
};

export function ClubStats({ club }: Props) {
  const { stats } = club;

  const rows = [
    { label: "Played",          value: stats.played },
    { label: "Won",             value: stats.won },
    { label: "Drawn",           value: stats.drawn },
    { label: "Lost",            value: stats.lost },
    { label: "Goals For",       value: stats.goalsFor },
    { label: "Goals Against",   value: stats.goalsAgainst },
    { label: "Goal Difference", value: stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference },
    { label: "Points",          value: stats.points },
  ];

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Season statistics"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Season Stats</h2>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-zinc-100 sm:grid-cols-4">
        {rows.map(({ label, value }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
            <p className="mt-0.5 text-xl font-black text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="flex items-center gap-2 border-t border-zinc-100 px-5 py-3">
        <span className="text-xs font-semibold text-zinc-500">Form</span>
        <div className="flex gap-1">
          {stats.form.map((result, i) => (
            <span
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${FORM_COLORS[result] ?? "bg-zinc-200 text-zinc-700"}`}
            >
              {result}
            </span>
          ))}
        </div>
        <span className="ml-auto text-xs text-zinc-400">← most recent</span>
      </div>
    </section>
  );
}
