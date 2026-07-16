import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTeam, getGroupStandings, getTournamentFixtures, getGroups, getTeamSquad } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import { FixtureCard } from "@/components/football/fixtures/FixtureCard";
import type { TournamentTeam, SquadPlayerPositionCode } from "@/types/tournament";

const BASE_URL = "https://footballke.site";

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
    description: `${team.name} at the 2026 FIFA World Cup — standings, fixtures, and full squad.`,
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
  UEFA:     "Europe (UEFA)",
  CAF:      "Africa (CAF)",
  CONMEBOL: "South America (CONMEBOL)",
  CONCACAF: "CONCACAF",
  AFC:      "Asia (AFC)",
  OFC:      "Oceania (OFC)",
};

// PDF extraction sometimes concatenates names without spaces ("NadhirAhmed").
// Split at lowercase→uppercase boundaries to make them readable.
function fmtName(displayName: string): string {
  const idx = displayName.indexOf(" ");
  if (idx === -1) return displayName;
  const rest = displayName.slice(idx + 1).replace(/([a-z])([A-Z])/g, "$1 $2");
  return `${displayName.slice(0, idx)} ${rest}`;
}

const POS_LABEL: Record<SquadPlayerPositionCode, string> = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};

const POS_COLOR: Record<SquadPlayerPositionCode, string> = {
  GK: "bg-amber-500",
  DF: "bg-blue-600",
  MF: "bg-emerald-600",
  FW: "bg-red-500",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [team, allStandings, { fixtures }, squad] = await Promise.all([
    getTeam(slug),
    getGroupStandings(),
    getTournamentFixtures({ teamSlug: slug, pageSize: 10 }),
    getTeamSquad(slug),
  ]);

  if (!team) notFound();

  const jsonLd = buildJsonLd(team);
  const teamGroup = allStandings.find((t) => t.rows.some((r) => r.team.slug === slug));
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

        {/* Hero header */}
        <header
          className="relative overflow-hidden rounded-2xl text-white"
          style={{
            background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
          }}
        >
          {/* Large abbreviation ghost */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden"
            aria-hidden="true"
          >
            <span className="select-none pr-6 font-black leading-none text-white opacity-10"
              style={{ fontSize: "clamp(5rem, 15vw, 12rem)" }}>
              {team.abbreviation}
            </span>
          </div>

          {/* Glow */}
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative px-6 py-10 sm:px-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                {CONFEDERATION_FULL[team.confederation] ?? team.confederation}
              </span>
              {team.groupLetter && (
                <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                  Group {team.groupLetter}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {team.name}
            </h1>

            {/* Stats strip */}
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-2xl font-black">#{team.fifaRanking}</p>
                <p className="text-[11px] uppercase tracking-widest opacity-60">FIFA Ranking</p>
              </div>
              {teamRow && (
                <>
                  <div>
                    <p className="text-2xl font-black">{teamRow.played}</p>
                    <p className="text-[11px] uppercase tracking-widest opacity-60">Played</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{teamRow.won}W {teamRow.drawn}D {teamRow.lost}L</p>
                    <p className="text-[11px] uppercase tracking-widest opacity-60">Record</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">
                      {teamRow.goalDifference > 0 ? `+${teamRow.goalDifference}` : teamRow.goalDifference}
                    </p>
                    <p className="text-[11px] uppercase tracking-widest opacity-60">Goal Diff</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{teamRow.points} pts</p>
                    <p className="text-[11px] uppercase tracking-widest opacity-60">Points</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Standing + Fixtures */}
        <div className="grid gap-6 lg:grid-cols-3">
          {teamGroup && teamRow && (
            <section
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
              aria-label={`Group ${teamGroup.group.letter} standing`}
            >
              <div className="flex items-center gap-3 bg-zinc-900 px-5 py-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                  {teamGroup.group.letter}
                </span>
                <h2 className="text-sm font-black text-white">Group {teamGroup.group.letter}</h2>
              </div>
              <table className="w-full text-xs" aria-label="Group standing">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400">
                    <th className="py-2 pl-5 text-left font-semibold">#</th>
                    <th className="py-2 text-left font-semibold">Team</th>
                    <th className="py-2 pr-2 text-right font-semibold">P</th>
                    <th className="py-2 pr-2 text-right font-semibold">GD</th>
                    <th className="py-2 pr-5 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {teamGroup.rows.map((row) => {
                    const isHighlighted = row.team.slug === slug;
                    const isTop2 = row.position <= 2;
                    return (
                      <tr
                        key={row.team.slug}
                        className={
                          isHighlighted
                            ? "bg-emerald-100/80"
                            : isTop2
                            ? "bg-emerald-50/50 hover:bg-emerald-50"
                            : "hover:bg-zinc-50"
                        }
                      >
                        <td className="py-2.5 pl-5">
                          <span className={`font-black ${isTop2 ? "text-emerald-600" : "text-zinc-300"}`}>
                            {row.position}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`flex items-center gap-2 font-bold ${isHighlighted ? "text-emerald-800" : "text-zinc-900"}`}>
                            <span
                              className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: row.team.colors.primary }}
                              aria-hidden="true"
                            />
                            {row.team.shortName}
                          </span>
                        </td>
                        <td className="py-2.5 pr-2 text-right text-zinc-500">{row.played}</td>
                        <td className="py-2.5 pr-2 text-right text-zinc-500">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 pr-5 text-right font-black text-zinc-900">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          <section className="lg:col-span-2" aria-label="Fixtures">
            <h2 className="mb-3 text-sm font-black tracking-tight">Fixtures &amp; Results</h2>
            {fixtures.length === 0 ? (
              <div className="rounded-xl border border-zinc-100 bg-white px-4 py-10 text-center">
                <p className="text-sm text-zinc-400">No fixtures found for {team.name}.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {fixtures.map((f) => <FixtureCard key={f.id} fixture={f} />)}
              </div>
            )}
          </section>
        </div>

        {/* Full squad */}
        {squad.length > 0 && (
          <section aria-label="Squad">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="text-lg font-black tracking-tight">Full Squad</h2>
              <span className="text-xs text-zinc-400">{squad.length} players</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {(["GK", "DF", "MF", "FW"] as SquadPlayerPositionCode[]).map((posCode) => {
                const posPlayers = squad.filter((p) => p.positionCode === posCode);
                if (!posPlayers.length) return null;
                return (
                  <div key={posCode}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`flex h-6 w-9 items-center justify-center rounded text-[10px] font-black text-white ${POS_COLOR[posCode]}`}>
                        {posCode}
                      </span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                        {POS_LABEL[posCode]}
                      </h3>
                      <span className="ml-auto text-xs text-zinc-300">{posPlayers.length}</span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-50">
                      {posPlayers.map((player, i) => (
                        <div
                          key={`${player.nameOnShirt}-${i}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-zinc-900">
                              {fmtName(player.displayName)}
                            </p>
                            <p className="truncate text-[11px] text-zinc-400">{player.club}</p>
                          </div>

                          <div className="flex shrink-0 items-center gap-5 text-right text-xs">
                            <div>
                              <p className="font-black tabular-nums text-zinc-700">{player.caps}</p>
                              <p className="text-zinc-400">caps</p>
                            </div>
                            <div>
                              <p className="font-black tabular-nums text-zinc-700">{player.height}</p>
                              <p className="text-zinc-400">cm</p>
                            </div>
                            <div>
                              <p className="font-black tabular-nums text-zinc-700">{player.goals}</p>
                              <p className="text-zinc-400">goals</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
