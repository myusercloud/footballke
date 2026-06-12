import Link from "next/link";
import type { Player } from "@/types/player";

type Props = { player: Player };

export function PlayerCareerInfo({ player }: Props) {
  const rows: { label: string; value: string }[] = [
    { label: "Age",            value: `${player.age} years` },
    { label: "Date of Birth",  value: new Date(player.dateOfBirth).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) },
    { label: "Nationality",    value: `${player.nationality.name} (${player.nationality.code})` },
    { label: "Height",         value: `${player.height} cm` },
    { label: "Preferred Foot", value: player.preferredFoot.charAt(0).toUpperCase() + player.preferredFoot.slice(1) },
    { label: "Position",       value: player.position },
    ...(player.secondaryPosition ? [{ label: "Alt. Position", value: player.secondaryPosition }] : []),
    { label: "Contract",       value: player.contract.until ? `Until ${player.contract.until.slice(0, 7)}` : "Not disclosed" },
    { label: "Contract Type",  value: player.contract.type.charAt(0).toUpperCase() + player.contract.type.slice(1) },
  ];

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Player information"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Profile</h2>
      </div>

      <dl className="divide-y divide-zinc-50">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4 px-5 py-2.5">
            <dt className="shrink-0 text-xs text-zinc-400">{label}</dt>
            <dd className="text-right text-sm font-semibold text-zinc-800">{value}</dd>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4 px-5 py-2.5">
          <dt className="shrink-0 text-xs text-zinc-400">Club</dt>
          <dd className="text-right">
            <Link
              href={`/clubs/${player.clubSlug}`}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {player.clubName} →
            </Link>
          </dd>
        </div>
      </dl>
    </section>
  );
}
