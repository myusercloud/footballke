import type { StandingRow } from "@/types/standings";
import { PositionBadge } from "./PositionBadge";
import { ClubCell } from "./ClubCell";
import { FormBadges } from "@/components/football/fixtures/FormBadges";

type Props = {
  row: StandingRow;
  hasBorderBottom?: boolean;
};

export function StandingsMobileCard({ row, hasBorderBottom = false }: Props) {
  const borderClass = hasBorderBottom
    ? "border-b-2 border-zinc-300"
    : "border-b border-zinc-100";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${borderClass}`}
      role="row"
      aria-label={`${row.club.name}, position ${row.position}`}
    >
      {/* Position badge */}
      <div className="shrink-0">
        <PositionBadge position={row.position} zone={row.zone} />
      </div>

      {/* Club name — grows to fill */}
      <div className="flex-1 min-w-0">
        <ClubCell club={row.club} compact />
      </div>

      {/* Stats summary: P / Pts */}
      <div className="shrink-0 flex items-center gap-3 text-xs text-zinc-500">
        <span className="tabular-nums">
          <span className="text-zinc-400">P</span>{" "}
          <span className="font-semibold text-zinc-700">{row.played}</span>
        </span>
        <span className="tabular-nums">
          <span className="text-zinc-400">Pts</span>{" "}
          <span className="font-black text-zinc-900">{row.points}</span>
        </span>
      </div>

      {/* Form badges */}
      <div className="shrink-0 hidden xs:flex">
        <FormBadges
          form={row.form}
          label={`${row.club.shortName} recent form`}
          size="sm"
        />
      </div>
    </div>
  );
}
