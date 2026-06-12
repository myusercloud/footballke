import type { Metadata } from "next";
import { getClubs } from "@/lib/clubs.cache";
import { ClubGrid } from "@/components/football/clubs/ClubGrid";

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Clubs",
  description:
    "All Kenyan Premier League clubs — standings, squads, fixtures, and profiles on FootballKE.",
  openGraph: {
    title: "KPL Clubs — FootballKE",
    description:
      "All Kenyan Premier League clubs — standings, squads, fixtures, and profiles.",
  },
  alternates: {
    canonical: "/clubs",
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ClubsPage() {
  const { clubs, total } = await getClubs();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          KPL Clubs
        </h1>
        {total > 0 && (
          <p className="shrink-0 text-sm text-zinc-500">
            {total} club{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <ClubGrid clubs={clubs} />
    </main>
  );
}
