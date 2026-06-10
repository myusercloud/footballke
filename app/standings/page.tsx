import type { Metadata } from "next";
import { getStandings, getStandingsCompetitions } from "@/lib/standings.cache";
import { StandingsTable } from "@/components/football/standings/StandingsTable";
import { StandingsFilters } from "@/components/football/standings/StandingsFilters";
import { EmptyStandings } from "@/components/football/standings/EmptyStandings";
import type { StandingsSortField } from "@/types/standings";

// ── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  competition?: string;
  season?: string;
  sort?: string;
};

type PageProps = { searchParams: Promise<SearchParams> };

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SORT = new Set<string>([
  "position",
  "points",
  "goalDifference",
  "goalsFor",
]);

function parseSort(raw: string | undefined): StandingsSortField {
  if (raw && VALID_SORT.has(raw)) return raw as StandingsSortField;
  return "position";
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { competition, season } = await searchParams;

  const result = await getStandings({
    competitionSlug: competition,
    season,
  });

  const compName = result?.table.competition.name ?? "KPL";
  const seasonLabel = result?.table.season.label ?? "";
  const title = `${compName} Standings${seasonLabel ? ` ${seasonLabel}` : ""}`;
  const description = `Full ${compName} league table${seasonLabel ? ` for ${seasonLabel}` : ""} — positions, points, goal difference, form and zone classification.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function StandingsPage({ searchParams }: PageProps) {
  const { competition, season, sort } = await searchParams;
  const sortBy = parseSort(sort);

  const [result, allCompetitions] = await Promise.all([
    getStandings({ competitionSlug: competition, season, sortBy }),
    getStandingsCompetitions(),
  ]);

  // Available seasons for the filter — scoped to the current competition.
  const availableSeasons = result?.availableSeasons ?? [];
  const activeCompetition =
    result?.table.competition.slug ??
    competition ??
    (allCompetitions[0]?.slug ?? "");
  const activeSeason =
    result?.table.season.id ?? season ?? (availableSeasons[0]?.id ?? "");

  return (
    <main className="flex-1 px-0 py-8 md:px-0 md:py-10">
      <div className="mx-auto max-w-4xl">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="px-4 pb-6 md:px-6">
          <h1 className="text-2xl font-black text-zinc-900 md:text-3xl">
            Standings
          </h1>
          {result && (
            <p className="mt-1 text-sm text-zinc-500">
              {result.table.competition.name} · {result.table.season.label}
            </p>
          )}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        {allCompetitions.length > 0 && (
          <div className="px-4 pb-6 md:px-6">
            <StandingsFilters
              competitions={allCompetitions}
              seasons={availableSeasons}
              activeCompetition={activeCompetition}
              activeSeason={activeSeason}
              activeSort={sortBy}
            />
          </div>
        )}

        {/* ── Table or empty state ─────────────────────────────────────── */}
        {result ? (
          <StandingsTable table={result.table} sortBy={sortBy} />
        ) : (
          <EmptyStandings />
        )}
      </div>
    </main>
  );
}
