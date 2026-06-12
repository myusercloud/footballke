import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getTournamentPlayer, getFeaturedPlayers } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import type { TournamentPlayer } from "@/types/tournament";

const BASE_URL = "https://footballke.com";

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

// ── Stat row helper ───────────────────────────────────────────────────────────

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center rounded-sm border border-zinc-100 bg-zinc-50 p-3 text-center">
      <span className="text-2xl font-black tabular-nums text-zinc-900">{value}</span>
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
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

        {/* Header */}
        <header
          className="rounded-sm p-6 text-white sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary}44 100%)`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* Jersey number */}
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/30 text-2xl font-black sm:h-20 sm:w-20 sm:text-3xl"
              style={{ backgroundColor: team.colors.secondary + "33" }}
              aria-hidden="true"
            >
              {player.jerseyNumber}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-75">
                {player.position}
                {player.secondaryPosition ? ` · ${player.secondaryPosition}` : ""}
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{player.name}</h1>
              <Link
                href={`/world-cup/teams/${team.slug}`}
                className="mt-1 inline-block text-sm font-semibold opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {team.name} →
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile info */}
          <section className="rounded-sm border border-zinc-200 bg-white p-5" aria-label="Profile">
            <h2 className="mb-4 text-sm font-black tracking-tight">Profile</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Age</dt>
                <dd className="font-semibold">{player.age} yrs</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Date of Birth</dt>
                <dd className="font-semibold">
                  {new Date(player.dateOfBirth).toLocaleDateString("en-KE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Nationality</dt>
                <dd className="font-semibold">{player.nationality.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Height</dt>
                <dd className="font-semibold">{player.height} cm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Preferred Foot</dt>
                <dd className="font-semibold capitalize">{player.preferredFoot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Position</dt>
                <dd className="font-semibold">{player.position}</dd>
              </div>
            </dl>
          </section>

          {/* Stats */}
          <section className="lg:col-span-2 space-y-4" aria-label="Tournament stats">
            <h2 className="text-sm font-black tracking-tight">2026 World Cup Stats</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
              <StatItem label="Goals" value={stats.goals} />
              <StatItem label="Assists" value={stats.assists} />
              <StatItem label="Apps" value={stats.appearances} />
              <StatItem label="Minutes" value={stats.minutesPlayed} />
              <StatItem label="Yellow" value={stats.yellowCards} />
              <StatItem label="Red" value={stats.redCards} />
              {stats.cleanSheets !== undefined && (
                <StatItem label="Clean Sheets" value={stats.cleanSheets} />
              )}
            </div>

            {player.bio && (
              <div className="rounded-sm border border-zinc-200 bg-white p-5">
                <h2 className="mb-2 text-sm font-black tracking-tight">About</h2>
                <p className="text-sm leading-relaxed text-zinc-600">{player.bio}</p>
              </div>
            )}
          </section>
        </div>

        {/* Back links */}
        <div className="flex gap-3 border-t border-zinc-200 pt-4">
          <Link
            href={`/world-cup/teams/${team.slug}`}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            ← {team.name}
          </Link>
          <Link
            href="/world-cup"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            World Cup Hub
          </Link>
        </div>
      </main>
    </>
  );
}
