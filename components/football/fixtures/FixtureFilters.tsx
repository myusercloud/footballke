"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Competition, Team } from "@/types/fixture";

type Props = {
  competitions: Competition[];
  teams: Team[];
  currentCompetitionSlug?: string | null;
  currentTeamSlug?: string | null;
  currentDateFrom?: string | null;
  currentDateTo?: string | null;
};

// Builds the /fixtures URL from the set of active filters.
// Any falsy value is omitted from the query string.
function buildUrl(filters: {
  competition: string | null;
  team: string;
  from: string;
  to: string;
}): string {
  const params = new URLSearchParams();
  if (filters.competition) params.set("competition", filters.competition);
  if (filters.team) params.set("team", filters.team);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `/fixtures?${qs}` : "/fixtures";
}

export function FixtureFilters({
  competitions,
  teams,
  currentCompetitionSlug = null,
  currentTeamSlug = null,
  currentDateFrom = null,
  currentDateTo = null,
}: Props) {
  const router = useRouter();

  // Local state allows each filter to update independently while the others
  // are preserved in the URL on navigation. Initialised from props (which come
  // from the page's searchParams) on each page render.
  const [competition, setCompetition] = useState<string | null>(
    currentCompetitionSlug ?? null
  );
  const [team, setTeam] = useState(currentTeamSlug ?? "");
  const [from, setFrom] = useState(currentDateFrom ?? "");
  const [to, setTo] = useState(currentDateTo ?? "");

  // Navigate with overrides applied on top of current state values.
  // Passing overrides avoids stale-closure issues when state hasn't yet
  // flushed between the setState call and the push.
  function navigate(overrides: Partial<typeof filters> = {}) {
    const filters = { competition, team, from, to, ...overrides };
    router.push(buildUrl(filters));
  }

  const filters = { competition, team, from, to };

  const hasActiveFilters =
    competition !== null || team !== "" || from !== "" || to !== "";

  function clearAll() {
    setCompetition(null);
    setTeam("");
    setFrom("");
    setTo("");
    router.push("/fixtures");
  }

  return (
    <div className="space-y-3">
      {/* ── Competition chips ─────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter by competition"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* "All" chip */}
        <button
          role="tab"
          aria-selected={competition === null}
          onClick={() => {
            setCompetition(null);
            navigate({ competition: null });
          }}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
            competition === null
              ? "bg-zinc-950 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          All
        </button>

        {competitions.map((comp) => {
          const isActive = competition === comp.slug;
          return (
            <button
              key={comp.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                const next = isActive ? null : comp.slug;
                setCompetition(next);
                navigate({ competition: next });
              }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                isActive
                  ? "bg-emerald-800 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {comp.name}
            </button>
          );
        })}
      </div>

      {/* ── Team + date row ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Team select */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="fixture-team-filter"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
          >
            Team
          </label>
          <select
            id="fixture-team-filter"
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              navigate({ team: e.target.value });
            }}
            className="rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="fixture-from-filter"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
          >
            From
          </label>
          <input
            id="fixture-from-filter"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="fixture-to-filter"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
          >
            To
          </label>
          <input
            id="fixture-to-filter"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          />
        </div>

        {/* Apply dates button — dates only navigate on explicit Apply to avoid
            navigation on every keystroke while the user is still typing */}
        {(from || to) && (
          <button
            onClick={() => navigate()}
            className="rounded-sm bg-emerald-800 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Apply
          </button>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs font-bold text-zinc-400 transition-colors hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
