import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClub, getClubs, getRelatedClubs } from "@/lib/clubs.cache";
import { getPlayersByClub } from "@/lib/players.cache";
import { getClubFixtures } from "@/lib/fixtures.cache";
import { getNews } from "@/lib/news.cache";
import { ClubHeader } from "@/components/football/clubs/ClubHeader";
import { ClubStats } from "@/components/football/clubs/ClubStats";
import { ClubAchievements } from "@/components/football/clubs/ClubAchievements";
import { SquadList } from "@/components/football/clubs/SquadList";
import { ClubFixturesPreview } from "@/components/football/clubs/ClubFixturesPreview";
import { ClubNewsPreview } from "@/components/football/clubs/ClubNewsPreview";
import { ClubGrid } from "@/components/football/clubs/ClubGrid";

const BASE_URL = "https://footballke.site";

export const dynamicParams = false;

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { clubs } = await getClubs();
  return clubs.map(({ slug }) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClub(slug);
  if (!club) return {};

  const description = `${club.name} — ${club.city} | KPL position ${club.stats.position}, ${club.stats.points} points. Squad, fixtures, and news on FootballKE.`;

  return {
    title: club.name,
    description,
    keywords: club.searchableKeywords,
    alternates: { canonical: `/clubs/${slug}` },
    openGraph: {
      title: `${club.name} — FootballKE`,
      description,
      type: "website",
      url: `${BASE_URL}/clubs/${slug}`,
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(club: Awaited<ReturnType<typeof getClub>>) {
  if (!club) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: club.name,
    sport: "Soccer",
    location: {
      "@type": "Place",
      name: club.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: club.venue.city,
        addressCountry: "KE",
      },
    },
    foundingDate: String(club.founded),
    url: `${BASE_URL}/clubs/${club.slug}`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ClubProfilePage({ params }: PageProps) {
  const { slug } = await params;

  const [club, players, fixtures, relatedClubs, { articles: recentNews }] = await Promise.all([
    getClub(slug),
    getPlayersByClub(slug),
    getClubFixtures(slug, 5),
    getRelatedClubs(slug, 4),
    getNews({ pageSize: 4 }),
  ]);

  if (!club) notFound();

  const jsonLd = buildJsonLd(club);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <ol className="flex items-center gap-1">
            <li>
              <a href="/clubs" className="hover:text-zinc-800">
                Clubs
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-zinc-800" aria-current="page">
              {club.shortName}
            </li>
          </ol>
        </nav>

        {/* Header banner */}
        <ClubHeader club={club} />

        {/* Body: 2-col sidebar layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Season stats */}
            <ClubStats club={club} />

            {/* Squad */}
            <SquadList players={players} clubSlug={slug} />

            {/* Fixtures */}
            <ClubFixturesPreview fixtures={fixtures} clubSlug={slug} />
          </div>

          {/* Right / sidebar */}
          <aside className="space-y-6">
            {/* Club info */}
            <section
              className="rounded-sm border border-zinc-200 bg-white"
              aria-label="Club information"
            >
              <div className="border-b border-zinc-100 px-5 py-3">
                <h2 className="text-sm font-black tracking-tight">About</h2>
              </div>
              <dl className="divide-y divide-zinc-50">
                {[
                  { label: "Founded",  value: String(club.founded) },
                  { label: "City",     value: club.city },
                  { label: "Country",  value: club.country },
                  { label: "Venue",    value: club.venue.name },
                  ...(club.venue.capacity
                    ? [{ label: "Capacity", value: club.venue.capacity.toLocaleString() }]
                    : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 px-5 py-2.5"
                  >
                    <dt className="shrink-0 text-xs text-zinc-400">{label}</dt>
                    <dd className="text-right text-sm font-semibold text-zinc-800">{value}</dd>
                  </div>
                ))}
              </dl>
              {club.description && (
                <p className="px-5 py-4 text-sm leading-relaxed text-zinc-600">
                  {club.description}
                </p>
              )}
            </section>

            {/* Achievements */}
            {club.achievements.length > 0 && (
              <ClubAchievements achievements={club.achievements} />
            )}

            <ClubNewsPreview articles={recentNews} />
          </aside>
        </div>

        {/* Related clubs */}
        {relatedClubs.length > 0 && (
          <div className="mt-10 border-t border-zinc-200 pt-8">
            <h2 className="mb-4 text-lg font-black tracking-tight">Other KPL Clubs</h2>
            <ClubGrid clubs={relatedClubs} />
          </div>
        )}
      </main>
    </>
  );
}
