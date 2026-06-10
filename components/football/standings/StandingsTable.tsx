import type {
  StandingsTable as StandingsTableType,
  StandingsSortField,
} from "@/types/standings";
import { StandingsRow } from "./StandingsRow";
import { StandingsMobileCard } from "./StandingsMobileCard";
import { StandingsLegend } from "./StandingsLegend";

type Props = {
  table: StandingsTableType;
  sortBy?: StandingsSortField;
};

// Returns true when the row at `index` is the last row of its zone,
// so a visual separator can be drawn between zone groups.
function isLastInZone(
  rows: StandingsTableType["rows"],
  index: number
): boolean {
  const current = rows[index];
  const next = rows[index + 1];

  if (!next) return false; // Last row in the table — no separator.
  if (current.zone === null && next.zone === null) return false;
  return current.zone !== next.zone;
}

const SORT_LABEL: Record<StandingsSortField, string> = {
  position:       "Position",
  points:         "Pts",
  goalDifference: "GD",
  goalsFor:       "GF",
};

type ThProps = {
  children: React.ReactNode;
  className?: string;
  sortBy: StandingsSortField;
  thisField?: StandingsSortField;
  "aria-label"?: string;
};

function Th({
  children,
  className = "",
  sortBy,
  thisField,
  "aria-label": ariaLabel,
}: ThProps) {
  const isActive = thisField !== undefined && sortBy === thisField;
  return (
    <th
      scope="col"
      aria-label={ariaLabel}
      className={`pb-2 text-center text-xs font-semibold uppercase tracking-wide ${
        isActive ? "text-zinc-800" : "text-zinc-400"
      } ${className}`}
    >
      {children}
      {isActive && (
        <span className="ml-0.5 text-zinc-400" aria-hidden="true">
          ▾
        </span>
      )}
    </th>
  );
}

export function StandingsTable({ table, sortBy = "position" }: Props) {
  const { rows, zones, competition, season, updatedAt } = table;

  const updatedDate = new Date(updatedAt).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });

  return (
    <section aria-label={`${competition.name} ${season.label} standings`}>
      {/* ── Desktop table ─────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-sm" role="table">
          <thead>
            <tr className="border-b border-zinc-200 text-left">
              {/* Position */}
              <th
                scope="col"
                className="pb-2 pl-4 pr-2 w-10 text-xs font-semibold uppercase tracking-wide text-zinc-400"
                aria-label="Position"
              >
                #
              </th>
              {/* Club */}
              <th
                scope="col"
                className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Club
              </th>
              <Th sortBy={sortBy} className="w-9" aria-label="Played">P</Th>
              <Th sortBy={sortBy} className="w-9" aria-label="Won">W</Th>
              <Th sortBy={sortBy} className="w-9" aria-label="Drawn">D</Th>
              <Th sortBy={sortBy} className="w-9" aria-label="Lost">L</Th>
              <Th
                sortBy={sortBy}
                thisField="goalsFor"
                className="hidden lg:table-cell w-9"
                aria-label="Goals for"
              >
                GF
              </Th>
              <Th sortBy={sortBy} className="hidden lg:table-cell w-9" aria-label="Goals against">
                GA
              </Th>
              <Th
                sortBy={sortBy}
                thisField="goalDifference"
                className="w-10"
                aria-label="Goal difference"
              >
                GD
              </Th>
              <Th
                sortBy={sortBy}
                thisField="points"
                className="w-10"
                aria-label="Points"
              >
                Pts
              </Th>
              <Th sortBy={sortBy} className="hidden lg:table-cell pl-2 pr-4 w-32 text-left">
                Form
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <StandingsRow
                key={row.club.id}
                row={row}
                sortBy={sortBy}
                hasBorderBottom={isLastInZone(rows, i)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────────────────────── */}
      <div
        className="md:hidden"
        role="table"
        aria-label={`${competition.name} ${season.label} standings`}
      >
        {/* Header row */}
        <div
          role="row"
          className="flex items-center gap-3 border-b border-zinc-200 px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
        >
          <span className="shrink-0 w-6">#</span>
          <span className="flex-1">Club</span>
          <span className="shrink-0">P / Pts</span>
          <span className="hidden xs:block shrink-0 w-[106px]">Form</span>
        </div>

        {rows.map((row, i) => (
          <StandingsMobileCard
            key={row.club.id}
            row={row}
            hasBorderBottom={isLastInZone(rows, i)}
          />
        ))}
      </div>

      {/* ── Footer: legend + last updated ────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <StandingsLegend zones={zones} />
        <p className="text-[11px] text-zinc-400">
          Updated {updatedDate}
        </p>
      </div>
    </section>
  );
}
