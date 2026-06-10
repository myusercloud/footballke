"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  Season,
  StandingsCompetition,
  StandingsSortField,
} from "@/types/standings";

type Props = {
  competitions: StandingsCompetition[];
  seasons: Season[];
  activeCompetition: string;
  activeSeason: string;
  activeSort: StandingsSortField;
};

const SORT_OPTIONS: { value: StandingsSortField; label: string }[] = [
  { value: "position",      label: "Position"       },
  { value: "points",        label: "Points"         },
  { value: "goalDifference",label: "Goal difference"},
  { value: "goalsFor",      label: "Goals scored"   },
];

export function StandingsFilters({
  competitions,
  seasons,
  activeCompetition,
  activeSeason,
  activeSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    // Reset to first page (if pagination is ever added).
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      role="group"
      aria-label="Standings filters"
    >
      {/* Competition */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="standings-competition"
          className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
        >
          Competition
        </label>
        <select
          id="standings-competition"
          value={activeCompetition}
          onChange={(e) => navigate("competition", e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          {competitions.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="standings-season"
          className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
        >
          Season
        </label>
        <select
          id="standings-season"
          value={activeSeason}
          onChange={(e) => navigate("season", e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="standings-sort"
          className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
        >
          Sort by
        </label>
        <select
          id="standings-sort"
          value={activeSort}
          onChange={(e) =>
            navigate("sort", e.target.value as StandingsSortField)
          }
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
