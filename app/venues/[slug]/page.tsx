import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFixtures } from "@/lib/fixtures.cache";
import { slugifyVenue } from "@/lib/venue.utils";
import { formatKickoffFull } from "@/lib/fixture.utils";

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { fixtures } = await getFixtures({ pageSize: 1000 });
  const seen = new Set<string>();
  for (const f of fixtures) {
    if (f.venue.name) seen.add(slugifyVenue(f.venue.name));
  }
  return Array.from(seen).map((slug) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { fixtures } = await getFixtures({ pageSize: 1000 });
  const match = fixtures.find((f) => f.venue.name && slugifyVenue(f.venue.name) === slug);
  if (!match) return {};
  const { venue } = match;
  return {
    title: venue.name,
    description: `All matches played at ${venue.name}${venue.city ? `, ${venue.city}` : ""} — FootballKE`,
    alternates: { canonical: `/venues/${slug}` },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const { fixtures: allFixtures } = await getFixtures({ pageSize: 1000 });

  const venueFixtures = allFixtures
    .filter((f) => f.venue.name && slugifyVenue(f.venue.name) === slug)
    .sort((a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime());

  if (venueFixtures.length === 0) notFound();

  const { venue } = venueFixtures[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/fixtures" className="hover:text-zinc-800">Fixtures</Link></li>
          <li aria-hidden="true" className="text-zinc-300">›</li>
          <li className="font-semibold text-zinc-800" aria-current="page">{venue.name}</li>
        </ol>
      </nav>

      {/* Venue header */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{venue.name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">
          {venue.city && <span>{venue.city}</span>}
          {venue.capacity && (
            <span>{venue.capacity.toLocaleString()} capacity</span>
          )}
          <span>{venueFixtures.length} {venueFixtures.length === 1 ? 'match' : 'matches'}</span>
        </div>
      </div>

      {/* Fixture list */}
      <section className="mt-7" aria-label="Matches at this venue">
        <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
          Matches Played Here
        </h2>
        <div className="divide-y divide-zinc-100 rounded-sm border border-zinc-200 bg-white shadow-sm">
          {venueFixtures.map((f) => {
            const hasScore = f.score != null;
            return (
              <Link
                key={f.id}
                href={`/fixtures/${f.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
              >
                {/* Teams */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Link
                      href={`/clubs/${f.homeTeam.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-emerald-700 focus:outline-none focus-visible:underline"
                    >
                      {f.homeTeam.shortName}
                    </Link>
                    <span className="text-zinc-400" aria-hidden="true">vs</span>
                    <Link
                      href={`/clubs/${f.awayTeam.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-emerald-700 focus:outline-none focus-visible:underline"
                    >
                      {f.awayTeam.shortName}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400">
                    {f.competition.name}
                    {f.matchday != null ? ` · MW${f.matchday}` : ""}
                    {" · "}{formatKickoffFull(f.kickoff)}
                  </p>
                </div>

                {/* Score */}
                {hasScore ? (
                  <span className="shrink-0 text-sm font-black tabular-nums text-zinc-800">
                    {f.score!.home}–{f.score!.away}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {f.status === 'scheduled' ? 'Upcoming' : f.status}
                  </span>
                )}

                <svg className="h-4 w-4 shrink-0 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
