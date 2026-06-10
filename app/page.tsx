import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getNews } from "@/lib/news.cache";
import { getUpcomingFixtures } from "@/lib/fixtures.cache";
import { formatKickoffTime } from "@/lib/fixture.utils";
import { getCompetitionStandings } from "@/lib/standings.cache";
import { getTransfers } from "@/lib/transfers.cache";
import { FormBadges } from "@/components/football/fixtures/FormBadges";
import { TransferBadge } from "@/components/football/transfers/TransferBadge";
import type { TableZone } from "@/types/standings";

export const metadata: Metadata = {
  title: "KPL Weekend Preview & Standings",
  description:
    "Pressure fixtures, derby tension, form checks, and the latest standings in the Kenyan Premier League.",
  openGraph: {
    title: "KPL Weekend Preview — FootballKE",
    description:
      "Pressure fixtures, derby tension, and form checks from the Kenyan Premier League.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

// ── Zone color maps (Tailwind v4 — complete static strings) ──────────────────

const ZONE_ROW: Record<TableZone, string> = {
  champions:             "border-l-[3px] border-l-amber-400 bg-amber-50/70",
  continental:           "border-l-[3px] border-l-emerald-500 bg-emerald-50/50",
  "continental-playoff": "border-l-[3px] border-l-teal-500 bg-teal-50/50",
  relegation:            "border-l-[3px] border-l-red-500 bg-red-50/50",
};

const ZONE_POS: Record<TableZone, string> = {
  champions:             "text-amber-500",
  continental:           "text-emerald-600",
  "continental-playoff": "text-teal-600",
  relegation:            "text-red-500",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Short weekday abbreviation in EAT — "Sat", "Sun", etc. */
function kickoffDay(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-KE", {
      weekday: "short",
      timeZone: "Africa/Nairobi",
    })
    .slice(0, 3);
}

/** Strips AM/PM so "3:00 PM" → "3:00" and "15:00" is already correct. */
function kickoffBadgeTime(iso: string): string {
  return formatKickoffTime(iso).replace(/\s*(AM|PM)$/i, "");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AdSlot({
  label,
  size,
  className = "",
}: {
  label: string;
  size: string;
  className?: string;
}) {
  return (
    <aside
      className={`flex min-h-24 items-center justify-center rounded border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center ${className}`}
      aria-label={`${label} advert slot`}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </p>
        <p className="mt-1 text-[10px] text-zinc-300">{size}</p>
      </div>
    </aside>
  );
}

function LiveTicker() {
  const items = [
    "Gor Mahia 2–0 Ulinzi Stars · FT",
    "Tusker FC 1–1 AFC Leopards · FT",
    "Police FC vs Bandari · KO 3 PM Sun",
  ];
  return (
    <div className="overflow-hidden border-b border-zinc-200 bg-emerald-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-0 px-4 sm:px-6 lg:px-8">
        <span className="mr-3 shrink-0 border-r border-emerald-700 py-2 pr-3 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
          Live
        </span>
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap py-2 text-xs font-semibold text-emerald-100 scrollbar-none">
          {items.map((item, i) => (
            <span key={i} className="shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PitchVisual() {
  return (
    <div
      className="relative min-h-[240px] overflow-hidden bg-emerald-800 text-white sm:min-h-[280px]"
      aria-hidden="true"
    >
      {/* Pitch markings */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.04)_50%,transparent_50%)] bg-[length:88px_100%]" />
      <div className="absolute inset-5 border border-white/30 sm:inset-7" />
      <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-white/30 sm:top-7 sm:h-[calc(100%-3.5rem)]" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 sm:h-24 sm:w-24" />
      <div className="absolute left-5 top-1/2 h-24 w-14 -translate-y-1/2 border-y border-r border-white/30 sm:left-7 sm:h-28 sm:w-16" />
      <div className="absolute right-5 top-1/2 h-24 w-14 -translate-y-1/2 border-y border-l border-white/30 sm:right-7 sm:h-28 sm:w-16" />
      {/* Player dots */}
      <div className="absolute left-[20%] top-[30%] h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,.12)]" />
      <div className="absolute right-[24%] top-[58%] h-3.5 w-3.5 rounded-full bg-lime-300 shadow-[0_0_0_5px_rgba(190,242,100,.16)]" />
      <div className="absolute left-[45%] top-[42%] h-3 w-3 rounded-full bg-white/60" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/20 to-transparent" />
      {/* Text */}
      <div className="absolute bottom-6 left-6 right-6 sm:bottom-7 sm:left-8 sm:right-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-300 sm:text-xs">
          FootballKE Match Centre
        </p>
        <p className="mt-2 text-2xl font-black leading-tight sm:text-3xl xl:text-4xl">
          Kenyan football, fixtures, standings, and stories in one place.
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [{ articles }, upcomingFixtures, kplStandings, { transfers: latestTransfers }] =
    await Promise.all([
      getNews({ pageSize: 7 }),
      getUpcomingFixtures(4),
      getCompetitionStandings("kpl"),
      getTransfers({ status: "confirmed", pageSize: 3 }),
    ]);

  const topStories = articles.slice(0, 3);
  const quickReads = articles.slice(3);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-emerald-800 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="min-h-screen overflow-x-hidden bg-[#f2f4ef] text-zinc-950">

        {/* ── Live ticker ── */}
        <LiveTicker />

        {/* ── Header ── */}
        <Navbar />

        {/* ── Main ── */}
        <main
          id="main-content"
          className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
        >
          <AdSlot label="Top banner" size="970 × 90" className="mb-5" />

          {/* ── Hero section ── */}
          <section
            aria-label="Lead story and upcoming fixtures"
            className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"
          >
            {/* Lead article */}
            <article
              className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md sm:grid sm:grid-cols-[.9fr_1.1fr]"
              aria-labelledby="lead-headline"
            >
              <PitchVisual />
              <div className="flex flex-col justify-between p-5 sm:p-7">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-600"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
                      Lead Story
                    </p>
                  </div>
                  <h2
                    id="lead-headline"
                    className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl xl:text-4xl"
                  >
                    KPL weekend preview: pressure fixtures, derby tension, and
                    form checks
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                    FootballKE follows Kenyan football from the top flight to
                    the counties, with match context, club news, tactical notes,
                    and sponsor-ready ad positions built into the experience.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:bg-emerald-900"
                  >
                    Read latest
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/fixtures"
                    className="inline-flex items-center gap-2 rounded-sm border border-zinc-300 px-5 py-2.5 text-sm font-bold transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:bg-zinc-100"
                  >
                    View fixtures
                  </Link>
                </div>
              </div>
            </article>

            {/* Fixtures widget + sidebar ad */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <AdSlot label="Sidebar ad" size="300 × 250" className="min-h-52 sm:min-h-full lg:min-h-52" />

              <section
                id="fixtures"
                className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm"
                aria-labelledby="fixtures-heading"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 id="fixtures-heading" className="text-lg font-black sm:text-xl">
                    Next Fixtures
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">
                    KPL
                  </span>
                </div>

                {upcomingFixtures.length > 0 ? (
                  <div className="mt-3 divide-y divide-zinc-100">
                    {upcomingFixtures.map((fixture) => (
                      <Link
                        key={fixture.id}
                        href={`/fixtures/${fixture.id}`}
                        className="group flex items-center gap-3 py-3 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-inset"
                      >
                        {/* Day + time badge */}
                        <div className="flex w-10 shrink-0 flex-col items-center rounded-sm bg-zinc-100 py-1.5 text-center">
                          <span className="text-[9px] font-black uppercase tracking-wide text-zinc-500">
                            {kickoffDay(fixture.kickoff)}
                          </span>
                          <span className="text-[10px] font-black text-zinc-800">
                            {kickoffBadgeTime(fixture.kickoff)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {fixture.homeTeam.shortName}
                          </p>
                          <p className="mt-0.5 truncate text-xs font-medium text-zinc-500">
                            vs {fixture.awayTeam.shortName}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                            {fixture.venue.name}
                          </p>
                        </div>

                        <svg
                          className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-400">
                    No upcoming fixtures scheduled.
                  </p>
                )}

                <Link
                  href="/fixtures"
                  className="mt-3 block text-center text-xs font-bold text-emerald-700 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  All fixtures →
                </Link>
              </section>
            </div>
          </section>

          {/* ── Top Stories ── */}
          <section
            id="news"
            className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]"
            aria-labelledby="news-heading"
          >
            <div>
              <div className="mb-5 flex items-center justify-between border-b border-zinc-200 pb-3">
                <h2 id="news-heading" className="text-xl font-black sm:text-2xl">
                  Top Stories
                </h2>
                <a
                  href="/news"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  All stories →
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {topStories.map((story) => (
                  <article
                    key={story.slug}
                    className="group relative flex flex-col rounded-sm border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600"
                  >
                    {story.featured && (
                      <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-700">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" aria-hidden="true" />
                        Hot
                      </span>
                    )}
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                      {story.category.name}
                    </p>
                    <h3 className="mt-2.5 text-base font-black leading-snug transition-colors group-hover:text-emerald-900 sm:text-lg">
                      <a href={`/news/${story.slug}`} className="focus:outline-none after:absolute after:inset-0">
                        {story.title}
                      </a>
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-6 text-zinc-600">
                      {story.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        {story.author.role}
                      </p>
                      <p className="text-[10px] font-semibold text-zinc-400">
                        {story.readingTime} min read
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Tall sidebar ad — hidden on small screens, visible from lg */}
            <AdSlot
              label="Medium rectangle"
              size="300 × 600"
              className="hidden min-h-full lg:flex"
            />
          </section>

          {/* ── Table + Quick Reads ── */}
          <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr]">

            {/* Table */}
            <div
              id="table"
              className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black sm:text-2xl">Table Snapshot</h2>
                <Link
                  href="/standings"
                  className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Full table
                </Link>
              </div>

              {kplStandings ? (
                <>
                  {/* Zone legend */}
                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {kplStandings.zones.map((z) => (
                      <span key={z.type} className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-sm ${
                            z.type === "champions"
                              ? "bg-amber-400"
                              : z.type === "continental"
                              ? "bg-emerald-500"
                              : z.type === "continental-playoff"
                              ? "bg-teal-500"
                              : "bg-red-500"
                          }`}
                          aria-hidden="true"
                        />
                        {z.label}
                      </span>
                    ))}
                  </div>

                  {/* Column headers */}
                  <div className="mt-3 grid grid-cols-[28px_1fr_36px_36px_auto] items-center gap-2 border-b border-zinc-200 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    <span>#</span>
                    <span>Club</span>
                    <span className="text-right">Pts</span>
                    <span className="hidden text-right sm:block">GD</span>
                    <span className="hidden sm:block">Form</span>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {kplStandings.rows.map((row) => (
                      <div
                        key={row.club.id}
                        className={`grid grid-cols-[28px_1fr_36px_36px_auto] items-center gap-2 py-2.5 transition-colors hover:bg-zinc-50 sm:py-3 ${
                          row.zone !== null
                            ? ZONE_ROW[row.zone]
                            : "border-l-[3px] border-l-transparent"
                        }`}
                      >
                        <span
                          className={`text-sm font-black ${
                            row.zone !== null ? ZONE_POS[row.zone] : "text-zinc-400"
                          }`}
                        >
                          {row.position}
                        </span>
                        <span className="truncate text-sm font-bold">
                          {row.club.shortName}
                        </span>
                        <span className="text-right text-sm font-black">
                          {row.points}
                        </span>
                        <span className="hidden text-right text-xs font-semibold text-zinc-500 sm:block">
                          {row.goalDifference > 0
                            ? `+${row.goalDifference}`
                            : row.goalDifference}
                        </span>
                        <div className="hidden sm:flex">
                          <FormBadges form={row.form} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-zinc-400">Standings unavailable.</p>
              )}
            </div>

            {/* Right column: Quick Reads + Advertise */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <section
                id="opinion"
                className="rounded-sm border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm sm:p-6"
                aria-labelledby="quick-reads-heading"
              >
                <h2 id="quick-reads-heading" className="text-xl font-black sm:text-2xl">
                  Quick Reads
                </h2>
                <div className="mt-4 divide-y divide-white/10">
                  {quickReads.map((story, i) => (
                    <a
                      key={story.slug}
                      className="group flex items-start gap-3 py-3.5 text-sm font-semibold leading-snug text-zinc-100 transition-colors hover:text-lime-300 focus:text-lime-300 focus:outline-none sm:items-center"
                      href={`/news/${story.slug}`}
                    >
                      <span className="mt-0.5 shrink-0 text-xs font-black text-zinc-600 transition-colors group-hover:text-lime-600 sm:mt-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">{story.title}</span>
                      <span className="hidden shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-400 sm:inline-block">
                        {story.category.name}
                      </span>
                      <svg
                        className="hidden h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </section>

              <section className="rounded-sm border border-emerald-900 bg-emerald-800 p-5 text-white shadow-sm sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-300">
                  Advertise with us
                </p>
                <h2 className="mt-3 text-xl font-black leading-tight sm:text-2xl">
                  Reach Kenyan football fans every matchday.
                </h2>
                <p className="mt-3 text-sm leading-6 text-emerald-100">
                  Leaderboard, sidebar, in-feed, and sponsored placements
                  for clubs, brands, and agencies.
                </p>
                <a
                  className="mt-5 inline-flex items-center gap-2 rounded-sm border border-white/60 px-4 py-2.5 text-sm font-bold transition-all hover:bg-white hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800 active:scale-[.98]"
                  href="mailto:ads@footballke.com"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ads@footballke.com
                </a>
              </section>
            </div>
          </section>

          {/* ── Latest Transfers ── */}
          {latestTransfers.length > 0 && (
            <section
              id="transfers"
              className="mt-7 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
              aria-labelledby="transfers-heading"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="transfers-heading" className="text-xl font-black sm:text-2xl">
                  Latest Transfers
                </h2>
                <Link
                  href="/transfers"
                  className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  All transfers
                </Link>
              </div>

              <div className="mt-4 divide-y divide-zinc-100">
                {latestTransfers.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
                  >
                    {/* Badge */}
                    <div className="shrink-0">
                      <TransferBadge status={t.status} confidence={t.confidence} />
                    </div>

                    {/* Player + movement */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-zinc-950">
                        {t.player.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-zinc-500">
                        <span className="font-semibold">{t.fromClub.shortName}</span>
                        <svg
                          className="h-3 w-3 shrink-0 text-zinc-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-emerald-700">{t.toClub.shortName}</span>
                        <span className="text-zinc-300">·</span>
                        <span>{t.fee}</span>
                      </div>
                    </div>

                    {/* Article link */}
                    {t.linkedArticleSlug && (
                      <Link
                        href={`/news/${t.linkedArticleSlug}`}
                        className="hidden shrink-0 text-[11px] font-bold text-zinc-400 underline underline-offset-2 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:inline-block"
                      >
                        Full story
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <AdSlot
            label="In-feed sponsor strip"
            size="728 × 90"
            className="mt-7"
          />
        </main>

        {/* ── Footer ── */}
        <Footer />
      </div>
    </>
  );
}
