import type { StandingRow, StandingsSortField } from "@/types/standings";
import { PositionBadge } from "./PositionBadge";
import { ClubCell } from "./ClubCell";
import { PointsCell } from "./PointsCell";
import { FormBadges } from "@/components/football/fixtures/FormBadges";

type Props = {
  row: StandingRow;
  sortBy?: StandingsSortField;
  hasBorderBottom?: boolean;
};

// Static map — Tailwind v4 safe
const GD_CLASS = {
  positive: "text-emerald-700",
  negative: "text-red-600",
  zero:     "text-zinc-500",
} as const;

function gdClass(gd: number): string {
  if (gd > 0) return GD_CLASS.positive;
  if (gd < 0) return GD_CLASS.negative;
  return GD_CLASS.zero;
}

function gdLabel(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

// Highlight the column that's being sorted (light bg tint).
const SORT_COL_HIGHLIGHT = "bg-zinc-50";

export function StandingsRow({
  row,
  sortBy = "position",
  hasBorderBottom = false,
}: Props) {
  const borderClass = hasBorderBottom
    ? "border-b-2 border-zinc-300"
    : "border-b border-zinc-100";

  return (
    <tr className={`transition-colors hover:bg-zinc-50 ${borderClass}`}>
      {/* Position */}
      <td className="py-2.5 pl-4 pr-2 w-10">
        <PositionBadge position={row.position} zone={row.zone} />
      </td>

      {/* Club name */}
      <td className="py-2.5 pr-4 min-w-0">
        <ClubCell club={row.club} href={`/clubs/${row.club.slug}`} />
      </td>

      {/* Played */}
      <td className="py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9">
        {row.played}
      </td>

      {/* Won */}
      <td className="py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9">
        {row.won}
      </td>

      {/* Drawn */}
      <td className="py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9">
        {row.drawn}
      </td>

      {/* Lost */}
      <td className="py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9">
        {row.lost}
      </td>

      {/* Goals For — hidden until lg */}
      <td
        className={`hidden lg:table-cell py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9 ${
          sortBy === "goalsFor" ? SORT_COL_HIGHLIGHT : ""
        }`}
      >
        {row.goalsFor}
      </td>

      {/* Goals Against — hidden until lg */}
      <td className="hidden lg:table-cell py-2.5 px-2 text-center text-sm tabular-nums text-zinc-600 w-9">
        {row.goalsAgainst}
      </td>

      {/* Goal Difference */}
      <td
        className={`py-2.5 px-2 text-center text-sm font-semibold tabular-nums w-10 ${gdClass(
          row.goalDifference
        )} ${sortBy === "goalDifference" ? SORT_COL_HIGHLIGHT : ""}`}
      >
        {gdLabel(row.goalDifference)}
      </td>

      {/* Points */}
      <td
        className={`py-2.5 px-2 text-center w-10 ${
          sortBy === "points" ? SORT_COL_HIGHLIGHT : ""
        }`}
      >
        <PointsCell points={row.points} zone={row.zone} />
      </td>

      {/* Form — hidden until lg */}
      <td className="hidden lg:table-cell py-2.5 pl-2 pr-4 w-32">
        <FormBadges
          form={row.form}
          label={`${row.club.shortName} recent form`}
          size="sm"
        />
      </td>
    </tr>
  );
}
