import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlayer, getPlayers } from "@/lib/players.cache";
import { getClub } from "@/lib/clubs.cache";
import { PlayerProfileHeader } from "@/components/football/players/PlayerProfileHeader";
import { PlayerStatsCard } from "@/components/football/players/PlayerStatsCard";
import { PlayerBio } from "@/components/football/players/PlayerBio";
import { PlayerCareerInfo } from "@/components/football/players/PlayerCareerInfo";
import { PlayerRelatedNews } from "@/components/football/players/PlayerRelatedNews";

const BASE_URL = "https://footballke.com";

export const dynamicParams = false;

// ── Static params — pre-renders all 150 player profiles at build time ─────────

export async function generateStaticParams() {
  const { players } = await getPlayers({ pageSize: 200 });
  return players.map(({ slug }) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayer(slug);
  if (!player) return {};

  const description = `${player.name} — ${player.position} for ${player.clubName}. ${player.stats.goals} goals, ${player.stats.assists} assists this season.`;

  return {
    title: player.name,
    description,
    keywords: player.searchableKeywords,
    alternates: { canonical: `/players/${slug}` },
    openGraph: {
      title: `${player.name} — FootballKE`,
      description,
      type: "profile",
      url: `${BASE_URL}/players/${slug}`,
    },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(player: NonNullable<Awaited<ReturnType<typeof getPlayer>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    nationality: player.nationality.name,
    birthDate: player.dateOfBirth,
    jobTitle: player.position,
    url: `${BASE_URL}/players/${player.slug}`,
    memberOf: {
      "@type": "SportsTeam",
      name: player.clubName,
      sport: "Soccer",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PlayerProfilePage({ params }: PageProps) {
  const { slug } = await params;

  const player = await getPlayer(slug);
  if (!player) notFound();

  // Fetch club color for the header; soft-fail if club not found
  const club = await getClub(player.clubSlug);
  const clubColor = club?.colors.primary ?? "#006B2D";

  const jsonLd = buildJsonLd(player);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <li>
              <a
                href={`/clubs/${player.clubSlug}`}
                className="hover:text-zinc-800"
              >
                {player.clubName}
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-zinc-800" aria-current="page">
              {player.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <PlayerProfileHeader player={player} clubColor={clubColor} />

        {/* Body */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <PlayerStatsCard player={player} />
            <PlayerBio player={player} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <PlayerCareerInfo player={player} />
            <PlayerRelatedNews articles={[]} playerName={player.name} />
          </aside>
        </div>
      </main>
    </>
  );
}
