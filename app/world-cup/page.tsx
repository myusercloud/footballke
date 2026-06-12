import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournament, getGroupStandings, getTopScorers, getFeaturedPlayers, getTournamentFixtures, getTournamentNews, getKnockoutRounds } from "@/lib/tournament.cache";
import { WorldCupHero } from "@/components/football/world-cup/WorldCupHero";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import { GroupCard } from "@/components/football/world-cup/GroupCard";
import { TopScorers } from "@/components/football/world-cup/TopScorers";
import { PlayerSpotlight } from "@/components/football/world-cup/PlayerSpotlight";
import { TournamentNews } from "@/components/football/world-cup/TournamentNews";
import { KnockoutPreview } from "@/components/football/world-cup/KnockoutPreview";
import { FeaturedFixture } from "@/components/football/fixtures/FeaturedFixture";
import { FixtureCard } from "@/components/football/fixtures/FixtureCard";
import type { Fixture } from "@/types/fixture";
import type { GroupStandingsTable } from "@/types/tournament";

const BASE_URL = "https://footballke.com";

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const tournament = await getTournament();
  return {
    title: tournament.name,
    description: `Live scores, group standings, top scorers, and fixtures for the ${tournament.name} hosted in ${tournament.host.countries.join(", ")}.`,
    alternates: { canonical: "/world-cup" },
    openGraph: {
      title: `${tournament.name} — FootballKE`,
      description: `Group standings, fixtures, top scorers, and player spotlights for ${tournament.name}.`,
      url: `${BASE_URL}/world-cup`,
      type: "website",
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(tournament: Awaited<ReturnType<typeof getTournament>>) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.name,
    startDate: tournament.dates.start,
    endDate: tournament.dates.end,
    location: tournament.host.countries.join(", "),
    url: `${BASE_URL}/world-cup`,
    organizer: { "@type": "Organization", name: "FIFA" },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function WorldCupPage() {
  const [tournament, groupStandings, topScorers, featuredPlayers, { fixtures }, knockoutRounds, news] =
    await Promise.all([
      getTournament(),
      getGroupStandings(),
      getTopScorers(8),
      getFeaturedPlayers(6),
      getTournamentFixtures({ status: ["live", "scheduled"], pageSize: 3 }),
      getKnockoutRounds(),
      getTournamentNews(5),
    ]);

  const featuredFixture = fixtures.find((f: Fixture) => (f as Fixture & { featured?: boolean }).featured) ?? fixtures[0] ?? null;
  const recentFixtures = fixtures.slice(0, 3);
  const jsonLd = buildJsonLd(tournament);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero */}
        <WorldCupHero tournament={tournament} />

        {/* Nav */}
        <Suspense>
          <TournamentNav />
        </Suspense>

        {/* Featured match + upcoming */}
        {featuredFixture && (
          <section aria-label="Featured match">
            <h2 className="mb-3 text-lg font-black tracking-tight">Featured Match</h2>
            <FeaturedFixture fixture={featuredFixture} />
          </section>
        )}

        {recentFixtures.length > 0 && (
          <section aria-label="Upcoming fixtures">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-black tracking-tight">Upcoming</h2>
              <a href="/world-cup/fixtures" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                All fixtures →
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentFixtures.map((f: Fixture) => <FixtureCard key={f.id} fixture={f} />)}
            </div>
          </section>
        )}

        {/* Group tables — first 4 */}
        <section aria-label="Group standings">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-black tracking-tight">Groups</h2>
            <a href="/world-cup/groups" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
              All groups →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {groupStandings.slice(0, 4).map((table: GroupStandingsTable) => (
              <GroupCard key={table.group.letter} table={table} />
            ))}
          </div>
        </section>

        {/* Scorers + News */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div id="scorers">
            <TopScorers scorers={topScorers} />
          </div>
          <div className="lg:col-span-2">
            <TournamentNews articles={news} />
          </div>
        </div>

        {/* Players */}
        <div id="players">
          <PlayerSpotlight players={featuredPlayers} />
        </div>

        {/* Knockout bracket */}
        {knockoutRounds.length > 0 && (
          <section aria-label="Knockout stage">
            <h2 className="mb-4 text-lg font-black tracking-tight">Knockout Stage</h2>
            <KnockoutPreview rounds={knockoutRounds} />
          </section>
        )}
      </main>
    </>
  );
}
