import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTeam, getGroupStandings, getTournamentFixtures, getGroups } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import { FixtureCard } from "@/components/football/fixtures/FixtureCard";
import { FixtureListSkeleton } from "@/components/football/world-cup/WorldCupSkeleton";
import type { TournamentTeam } from "@/types/tournament";

const BASE_URL = "https://footballke.com";

// ── SSG ───────────────────────────────────────────────────────────────────────

export const dynamicParams = false;

export async function generateStaticParams() {
  const groups = await getGroups();
  return groups.flatMap((g) => g.teams.map((t) => ({ slug: t.slug })));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) return { title: "Team not found" };
  return {
    title: team.name,
    description: `${team.name} at the 2026 FIFA World Cup — standings, fixtures, and squad info.`,
    alternates: { canonical: `/world-cup/teams/${slug}` },
    openGraph: {
      title: `${team.name} — 2026 FIFA World Cup`,
      description: `Follow ${team.name}'s journey at the 2026 World Cup.`,
      url: `${BASE_URL}/world-cup/teams/${slug}`,
      type: "website",
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(team: TournamentTeam) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Football",
    url: `${BASE_URL}/world-cup/teams/${team.slug}`,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CONFEDERATION_FULL: Record<string, string> = {
  UEFA: "Europe (UEFA)",
  CAF: "Africa (CAF)",
  CONMEBOL: "South America (CONMEBOL)",
  CONCACAF: "CONCACAF",
  AFC: "Asia (AFC)",
  OFC: "Oceania (OFC)",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [team, allStandings, { fixtures }] = await Promise.all([
    getTeam(slug),
    getGroupStandings(),
    getTournamentFixtures({ teamSlug: slug, pageSize: 10 }),
  ]);

  if (!team) notFound();

  const jsonLd = buildJsonLd(team);

  const teamGroup = allStandings.find((t) =>
    t.rows.some((r) => r.team.slug === slug)
  );
  const teamRow = teamGroup?.rows.find((r) => r.team.slug === slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Suspense>
          <TournamentNav />
        </Suspense>

        {/* Header */}
        <header
          className="rounded-sm p-6 text-white sm:p-8"
          style={{ background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary}44 100%)` }}
        >
          <p className="text-xs font-bold uppercase tracking-widest opacity-75">
            {CONFEDERATION_FULL[team.confederation] ?? team.confederation}
            {team.groupLetter ? ` · Group ${team.groupLetter}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{team.name}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="font-semibold opacity-90">
              FIFA Ranking: <strong>#{team.fifaRanking}</strong>
            </span>
            {teamRow && (
              <span className="font-semibold opacity-90">
                Points: <strong>{teamRow.points}</strong>
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Group standing */}
          {teamGroup && teamRow && (
            <section
              className="rounded-sm border border-zinc-200 bg-white p-5"
              aria-label={`Group ${teamGroup.group.letter} standing`}
            >
              <h2 className="mb-4 text-sm font-black tracking-tight">
                Group {teamGroup.group.letter} Standing
              </h2>
              <table className="w-full text-xs" aria-label="Group standing">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400">
                    <th className="pb-1.5 text-left font-semibold">Team</th>
                    <th className="pb-1.5 pr-1 text-right font-semibold">P</th>
                    <th className="pb-1.5 pr-1 text-right font-semibold">GD</th>
                    <th className="pb-1.5 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {teamGroup.rows.map((row) => (
                    <tr
                      key={row.team.slug}
                      className={row.team.slug === slug ? "bg-emerald-50" : "hover:bg-zinc-50"}
                    >
                      <td className="py-2 font-bold text-zinc-900">
                        {row.position}. {row.team.shortName}
                      </td>
                      <td className="py-2 pr-1 text-right text-zinc-500">{row.played}</td>
                      <td className="py-2 pr-1 text-right text-zinc-500">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-2 text-right font-black text-zinc-900">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Fixtures */}
          <section className="lg:col-span-2" aria-label="Fixtures">
            <h2 className="mb-3 text-sm font-black tracking-tight">Fixtures & Results</h2>
            {fixtures.length === 0 ? (
              <p className="rounded-sm border border-zinc-100 bg-white px-4 py-8 text-center text-sm text-zinc-400">
                No fixtures found for {team.name}.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {fixtures.map((f) => <FixtureCard key={f.id} fixture={f} />)}
              </div>
            )}
          </section>
        </div>

        {/* Team info */}
        <section className="rounded-sm border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-black tracking-tight">Team Information</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400">Confederation</dt>
              <dd className="mt-1 font-semibold text-zinc-900">
                {CONFEDERATION_FULL[team.confederation] ?? team.confederation}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400">FIFA Ranking</dt>
              <dd className="mt-1 font-semibold text-zinc-900">#{team.fifaRanking}</dd>
            </div>
            {team.groupLetter && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400">Group</dt>
                <dd className="mt-1 font-semibold text-zinc-900">Group {team.groupLetter}</dd>
              </div>
            )}
            {teamRow && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-zinc-400">Status</dt>
                <dd className="mt-1 font-semibold capitalize text-zinc-900">{teamRow.status}</dd>
              </div>
            )}
          </dl>
        </section>
      </main>
    </>
  );
}
