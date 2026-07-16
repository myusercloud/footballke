import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getTournamentPlayer, getFeaturedPlayers } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import type { TournamentPlayer } from "@/types/tournament";

const BASE_URL = "https://footballke.site";

// ── SSG ───────────────────────────────────────────────────────────────────────

export const dynamicParams = false;

export async function generateStaticParams() {
  const players = await getFeaturedPlayers();
  return players.map((p) => ({ slug: p.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const player = await getTournamentPlayer(slug);
  if (!player) return { title: "Player not found" };
  return {
    title: player.name,
    description: `${player.name} stats, profile, and 2026 FIFA World Cup performance.`,
    alternates: { canonical: `/world-cup/players/${slug}` },
    openGraph: {
      title: `${player.name} — 2026 FIFA World Cup`,
      description: `${player.name} (${player.team.name}) at the 2026 World Cup. ${player.stats.goals} goals, ${player.stats.assists} assists.`,
      url: `${BASE_URL}/world-cup/players/${slug}`,
      type: "profile",
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(player: TournamentPlayer) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    description: player.bio || undefined,
    nationality: player.nationality.name,
    url: `${BASE_URL}/world-cup/players/${player.slug}`,
    birthDate: player.dateOfBirth,
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-xl p-4 text-center ${highlight ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-zinc-50"}`}>
      <span className={`text-3xl font-black tabular-nums ${highlight ? "text-emerald-700" : "text-zinc-900"}`}>
        {value}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TournamentPlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = await getTournamentPlayer(slug);
  if (!player) notFound();

  const jsonLd = buildJsonLd(player);
  const { team, stats } = player;

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

        {/* Hero */}
        <header
          className="relative overflow-hidden rounded-2xl text-white"
          style={{
            background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
          }}
        >
          {/* Huge jersey number ghost */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="select-none pr-4 font-black leading-none text-white opacity-[0.08]"
              style={{ fontSize: "clamp(8rem, 22vw, 18rem)" }}
            >
              {player.jerseyNumber}
            </span>
          </div>

          {/* Glow */}
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative px-6 py-10 sm:px-10">
            {/* Position badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
                {player.position}
              </span>
              {player.secondaryPosition && (
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest">
                  {player.secondaryPosition}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {player.name}
            </h1>

            <Link
              href={`/world-cup/teams/${team.slug}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                style={{ backgroundColor: team.colors.secondary }}
                aria-hidden="true"
              />
              {team.name} →
            </Link>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-3xl font-black tabular-nums">{stats.goals}</p>
                <p className="text-[11px] uppercase tracking-widest opacity-60">Goals</p>
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums">{stats.assists}</p>
                <p className="text-[11px] uppercase tracking-widest opacity-60">Assists</p>
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums">{stats.appearances}</p>
                <p className="text-[11px] uppercase tracking-widest opacity-60">Apps</p>
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums">{stats.minutesPlayed}</p>
                <p className="text-[11px] uppercase tracking-widest opacity-60">Minutes</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6" aria-label="Profile">
            <h2 className="mb-5 text-sm font-black tracking-tight">Profile</h2>
            <dl className="space-y-4 text-sm">
              {[
                { label: "Full Name", value: player.name },
                { label: "Age", value: `${player.age} years old` },
                {
                  label: "Date of Birth",
                  value: new Date(player.dateOfBirth).toLocaleDateString("en-KE", {
                    day: "numeric", month: "long", year: "numeric",
                  }),
                },
                { label: "Nationality", value: player.nationality.name },
                { label: "Height", value: `${player.height} cm` },
                { label: "Preferred Foot", value: player.preferredFoot.charAt(0).toUpperCase() + player.preferredFoot.slice(1) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</dt>
                  <dd className="text-right font-semibold text-zinc-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Stats grid */}
          <section className="space-y-5 lg:col-span-2" aria-label="Tournament stats">
            <h2 className="text-sm font-black tracking-tight">2026 World Cup Stats</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
              <StatCard label="Goals" value={stats.goals} highlight={stats.goals > 0} />
              <StatCard label="Assists" value={stats.assists} highlight={stats.assists > 0} />
              <StatCard label="Appearances" value={stats.appearances} />
              <StatCard label="Minutes" value={stats.minutesPlayed} />
              <StatCard label="Yellow Cards" value={stats.yellowCards} />
              <StatCard label="Red Cards" value={stats.redCards} />
              {stats.cleanSheets !== undefined && (
                <StatCard label="Clean Sheets" value={stats.cleanSheets} highlight={stats.cleanSheets > 0} />
              )}
            </div>

            {player.bio && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-black tracking-tight">About</h2>
                <p className="text-sm leading-relaxed text-zinc-600">{player.bio}</p>
              </div>
            )}
          </section>
        </div>

        {/* Back links */}
        <div className="flex gap-4 border-t border-zinc-200 pt-5">
          <Link
            href={`/world-cup/teams/${team.slug}`}
            className="text-sm font-bold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            ← {team.name}
          </Link>
          <Link
            href="/world-cup"
            className="text-sm font-semibold text-zinc-400 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            World Cup Hub
          </Link>
        </div>
      </main>
    </>
  );
}
