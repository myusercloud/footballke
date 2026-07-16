import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MatchHeader } from "@/components/football/fixtures/MatchHeader";
import { GoalEvents } from "@/components/football/fixtures/GoalEvents";
import { getFixture, getFixtures } from "@/lib/fixtures.cache";
import {
  formatKickoffFull,
  formatKickoffTime,
} from "@/lib/fixture.utils";
import type { Fixture, MatchStatus } from "@/types/fixture";

// ── Static generation ─────────────────────────────────────────────────────────

// Only IDs returned by generateStaticParams are valid.
// Any other path returns 404 immediately without a render attempt.
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { fixtures } = await getFixtures({ pageSize: 100 });
  return fixtures.map(({ id }) => ({ id }));
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ id: string }> };

// ── Schema.org helpers ────────────────────────────────────────────────────────

// Static Record — Tailwind-safe pattern extended to schema.org URLs
const SCHEMA_EVENT_STATUS: Record<MatchStatus, string> = {
  scheduled: "https://schema.org/EventScheduled",
  live: "https://schema.org/EventScheduled",
  halftime: "https://schema.org/EventScheduled",
  fulltime: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
};

function buildJsonLd(fixture: Fixture): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
    description:
      fixture.preview ??
      `${fixture.competition.name} — ${formatKickoffFull(fixture.kickoff)} at ${fixture.venue.name}`,
    startDate: fixture.kickoff,
    location: {
      "@type": "SportsActivityLocation",
      name: fixture.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: fixture.venue.city,
        addressCountry: "KE",
      },
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: fixture.homeTeam.name,
      sport: "Soccer",
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: fixture.awayTeam.name,
      sport: "Soccer",
    },
    organizer: {
      "@type": "Organization",
      name: "Football Kenya Federation",
      url: "https://www.fkf.co.ke",
    },
    eventStatus: SCHEMA_EVENT_STATUS[fixture.status],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Soccer",
    url: `https://footballke.site/fixtures/${fixture.id}`,
  };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fixture = await getFixture(id);
  if (!fixture) return { title: "Match not found" };

  const title = `${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName}`;
  const description =
    fixture.preview ??
    `${fixture.competition.name} · ${formatKickoffFull(fixture.kickoff)} · ${fixture.venue.name}`;

  return {
    title,
    description,
    alternates: { canonical: `/fixtures/${id}` },
    openGraph: {
      title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
      description,
      type: "website",
      url: `https://footballke.site/fixtures/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 200),
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Breadcrumb({ fixture }: { fixture: Fixture }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-zinc-800"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-zinc-300">
          ›
        </li>
        <li>
          <Link
            href="/fixtures"
            className="transition-colors hover:text-zinc-800"
          >
            Fixtures
          </Link>
        </li>
        <li aria-hidden="true" className="text-zinc-300">
          ›
        </li>
        <li
          className="max-w-[200px] truncate font-semibold text-zinc-800 sm:max-w-xs"
          aria-current="page"
        >
          {fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}
        </li>
      </ol>
    </nav>
  );
}

type StatRowProps = {
  label: string;
  home: number;
  away: number;
  isPercent?: boolean;
};

function StatRow({ label, home, away, isPercent = false }: StatRowProps) {
  const total = isPercent ? 100 : home + away;
  const homePct = total === 0 ? 50 : Math.round((home / total) * 100);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="w-10 shrink-0 text-right text-sm font-black tabular-nums">
          {isPercent ? `${home}%` : home}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full bg-emerald-600"
            style={{ width: `${homePct}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="w-10 shrink-0 text-sm font-black tabular-nums">
          {isPercent ? `${away}%` : away}
        </span>
      </div>
      <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const fixture = await getFixture(id);

  // getFixture returns null for unknown IDs, but dynamicParams = false means
  // this path only runs for IDs from generateStaticParams. The null check
  // exists to narrow the type for TypeScript and as a safety net.
  if (!fixture) notFound();

  const jsonLd = buildJsonLd(fixture);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb fixture={fixture} />

        {/* ── Match header (competition, teams, score, form) ──────────────── */}
        <MatchHeader fixture={fixture} />

        {/* ── Goal scorers ────────────────────────────────────────────────── */}
        <GoalEvents
          homeTeam={fixture.homeTeam}
          awayTeam={fixture.awayTeam}
          goalEvents={fixture.goalEvents}
        />

        {/* ── Match preview ───────────────────────────────────────────────── */}
        {fixture.preview && (
          <section
            aria-label="Match preview"
            className="mt-7 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Match Preview
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-700">
              {fixture.preview}
            </p>
          </section>
        )}

        {/* ── Match statistics (fulltime and live) ────────────────────────── */}
        {fixture.stats && (
          <section
            aria-label="Match statistics"
            className="mt-7 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                Match Stats
              </h2>
              {/* Team name labels above the stat bars */}
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                <span>{fixture.homeTeam.shortName}</span>
                <span className="w-10" aria-hidden="true" />
                <span>{fixture.awayTeam.shortName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <StatRow
                label="Possession"
                home={fixture.stats.home.possession}
                away={fixture.stats.away.possession}
                isPercent
              />
              <StatRow
                label="Shots"
                home={fixture.stats.home.shots}
                away={fixture.stats.away.shots}
              />
              <StatRow
                label="Shots on Target"
                home={fixture.stats.home.shotsOnTarget}
                away={fixture.stats.away.shotsOnTarget}
              />
              <StatRow
                label="Corners"
                home={fixture.stats.home.corners}
                away={fixture.stats.away.corners}
              />
              <StatRow
                label="Fouls"
                home={fixture.stats.home.fouls}
                away={fixture.stats.away.fouls}
              />
              <StatRow
                label="Yellow Cards"
                home={fixture.stats.home.yellowCards}
                away={fixture.stats.away.yellowCards}
              />
              <StatRow
                label="Red Cards"
                home={fixture.stats.home.redCards}
                away={fixture.stats.away.redCards}
              />
            </div>
          </section>
        )}

        {/* ── Fixture meta footer ──────────────────────────────────────────── */}
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              {fixture.competition.name}
              {fixture.matchday != null ? ` · Matchday ${fixture.matchday}` : ""}
            </span>
            <Link href={`/clubs/${fixture.homeTeam.slug}`} className="hover:text-emerald-700 hover:underline">
              {fixture.homeTeam.shortName}
            </Link>
            <span aria-hidden="true">vs</span>
            <Link href={`/clubs/${fixture.awayTeam.slug}`} className="hover:text-emerald-700 hover:underline">
              {fixture.awayTeam.shortName}
            </Link>
          </div>
          <span>
            {formatKickoffFull(fixture.kickoff)} · {formatKickoffTime(fixture.kickoff)} EAT
          </span>
        </footer>
      </main>
    </>
  );
}
