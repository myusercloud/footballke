import type { Metadata } from "next";
import { FeaturedFixture } from "@/components/football/fixtures/FeaturedFixture";
import { FixtureGrid } from "@/components/football/fixtures/FixtureGrid";
import { FixtureFilters } from "@/components/football/fixtures/FixtureFilters";
import { FixturePagination } from "@/components/football/fixtures/FixturePagination";
import { EmptyFixtures } from "@/components/football/fixtures/EmptyFixtures";
import {
  getFixtures,
  getCompletedFixtures,
  getCompetitions,
  getTeams,
} from "@/lib/fixtures.cache";
import type { Fixture } from "@/types/fixture";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "YYYY-MM-DD" in Africa/Nairobi — used to slice fixtures into today / future */
function nairobi(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

// ── Types ────────────────────────────────────────────────────────────────────

type SearchParams = {
  competition?: string;
  team?: string;
  from?: string;
  to?: string;
  page?: string;
};

type PageProps = { searchParams: Promise<SearchParams> };

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { competition, team } = await searchParams;

  const [competitions, teams] = await Promise.all([
    getCompetitions(),
    getTeams(),
  ]);

  let title = "Fixtures";
  let description =
    "KPL fixtures — live scores, upcoming matches, and full results for the Kenyan Premier League.";

  if (team) {
    const found = teams.find((t) => t.slug === team);
    if (found) {
      title = `${found.name} Fixtures`;
      description = `Upcoming and recent fixtures for ${found.name} — Kenyan Premier League.`;
    }
  } else if (competition) {
    const found = competitions.find((c) => c.slug === competition);
    if (found) {
      title = `${found.name} Fixtures`;
      description = `Live scores, upcoming matches, and results for the ${found.name}.`;
    }
  }

  return {
    title,
    description,
    alternates: { canonical: "/fixtures" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://footballke.site/fixtures",
    },
    twitter: { card: "summary", title, description },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function FixturesPage({ searchParams }: PageProps) {
  const { competition, team, from, to, page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const hasFilters = !!(competition || team || from || to);

  const [competitions, teams] = await Promise.all([
    getCompetitions(),
    getTeams(),
  ]);

  // ── Filtered mode (any filter active) ─────────────────────────────────────
  // Shows a flat, paginated fixture list that respects all applied filters.
  if (hasFilters) {
    const { fixtures, totalPages } = await getFixtures({
      page,
      pageSize: PAGE_SIZE,
      competitionSlug: competition,
      teamSlug: team,
      dateFrom: from,
      dateTo: to,
    });

    const heading = (() => {
      if (team) {
        const t = teams.find((t) => t.slug === team);
        return t ? `${t.name} Fixtures` : "Fixtures";
      }
      if (competition) {
        const c = competitions.find((c) => c.slug === competition);
        return c ? `${c.name} Fixtures` : "Fixtures";
      }
      return "Fixtures";
    })();

    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">
            {heading}
          </h1>
        </header>

        <div className="mb-6 rounded-sm border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <FixtureFilters
            competitions={competitions}
            teams={teams}
            currentCompetitionSlug={competition}
            currentTeamSlug={team}
            currentDateFrom={from}
            currentDateTo={to}
          />
        </div>

        {fixtures.length === 0 ? (
          <EmptyFixtures hasActiveFilters />
        ) : (
          <>
            <FixtureGrid fixtures={fixtures} />
            {totalPages > 1 && (
              <div className="mt-8">
                <FixturePagination
                  page={page}
                  totalPages={totalPages}
                  competitionSlug={competition}
                  teamSlug={team}
                  dateFrom={from}
                  dateTo={to}
                />
              </div>
            )}
          </>
        )}
      </main>
    );
  }

  // ── Curated mode (no filters) ──────────────────────────────────────────────
  // Shows sectioned view: live → today's matches → upcoming → results → postponed.
  const today = nairobi(0);
  const tomorrow = nairobi(1);

  const [liveData, todayData, upcomingData, completedFixtures, postponedData] =
    await Promise.all([
      getFixtures({ status: ["live", "halftime"] }),
      getFixtures({ status: "scheduled", dateFrom: today, dateTo: today }),
      getFixtures({ status: "scheduled", dateFrom: tomorrow, pageSize: 8 }),
      getCompletedFixtures(6),
      getFixtures({ status: "postponed" }),
    ]);

  const liveFixtures = liveData.fixtures;
  const todayFixtures = todayData.fixtures;
  const upcomingFixtures = upcomingData.fixtures;
  const postponedFixtures = postponedData.fixtures;

  // Featured fixture: prefer a live+featured match, then any live, then an
  // upcoming+featured, then the first match today/upcoming.
  const featuredFixture: Fixture | null =
    liveFixtures.find((f) => f.featured) ??
    liveFixtures[0] ??
    todayFixtures.find((f) => f.featured) ??
    upcomingFixtures.find((f) => f.featured) ??
    todayFixtures[0] ??
    upcomingFixtures[0] ??
    null;

  // Exclude the featured fixture from its source section to prevent duplication.
  const liveSectionFixtures = liveFixtures.filter(
    (f) => f.id !== featuredFixture?.id
  );
  const todaySectionFixtures = todayFixtures.filter(
    (f) => f.id !== featuredFixture?.id
  );

  const totalMatches =
    liveFixtures.length +
    todayFixtures.length +
    upcomingFixtures.length +
    completedFixtures.length +
    postponedFixtures.length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">
          Fixtures
        </h1>
      </header>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 rounded-sm border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <FixtureFilters
          competitions={competitions}
          teams={teams}
          currentCompetitionSlug={null}
          currentTeamSlug={null}
          currentDateFrom={null}
          currentDateTo={null}
        />
      </div>

      {totalMatches === 0 ? (
        <EmptyFixtures
          heading="No fixtures available"
          message="Check back soon for upcoming KPL matches."
        />
      ) : (
        <div className="space-y-10">
          {/* Featured fixture hero ──────────────────────────────────────────── */}
          {featuredFixture && (
            <section aria-label="Featured fixture">
              <FeaturedFixture fixture={featuredFixture} />
            </section>
          )}

          {/* Live / Half-time ───────────────────────────────────────────────── */}
          {liveSectionFixtures.length > 0 && (
            <FixtureGrid fixtures={liveSectionFixtures} title="Live Now" />
          )}

          {/* Today's matches ────────────────────────────────────────────────── */}
          {todaySectionFixtures.length > 0 && (
            <FixtureGrid
              fixtures={todaySectionFixtures}
              title="Today's Matches"
              description="Upcoming kick-offs today"
            />
          )}

          {/* Upcoming ───────────────────────────────────────────────────────── */}
          {upcomingFixtures.length > 0 && (
            <FixtureGrid
              fixtures={upcomingFixtures}
              title="Upcoming"
              description="Next scheduled matches"
            />
          )}

          {/* Results ────────────────────────────────────────────────────────── */}
          {completedFixtures.length > 0 && (
            <FixtureGrid
              fixtures={completedFixtures}
              title="Results"
              description="Recent completed matches"
            />
          )}

          {/* Postponed ──────────────────────────────────────────────────────── */}
          {postponedFixtures.length > 0 && (
            <FixtureGrid fixtures={postponedFixtures} title="Postponed" />
          )}
        </div>
      )}
    </main>
  );
}
