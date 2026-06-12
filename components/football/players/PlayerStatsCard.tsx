import type { Player } from "@/types/player";

type Props = { player: Player };

export function PlayerStatsCard({ player }: Props) {
  const { stats, position } = player;
  const isGk = position === "Goalkeeper";

  const cells = [
    { label: "Apps",    value: stats.appearances },
    { label: "Goals",   value: stats.goals },
    { label: "Assists", value: stats.assists },
    ...(isGk ? [{ label: "Clean Sheets", value: stats.cleanSheets ?? 0 }] : []),
    { label: "Yellow",  value: stats.yellowCards },
    { label: "Red",     value: stats.redCards },
    { label: "Minutes", value: stats.minutesPlayed.toLocaleString() },
  ];

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Season statistics"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">This Season</h2>
      </div>

      <div className={`grid grid-cols-${isGk ? 3 : 3} divide-x divide-y divide-zinc-100`}>
        {cells.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4">
            <span className="text-2xl font-black text-zinc-900">{value}</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-400">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
