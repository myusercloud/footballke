import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournamentFixtures } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import { FixtureCard } from "@/components/football/fixtures/FixtureCard";
import { FixtureListSkeleton } from "@/components/football/world-cup/WorldCupSkeleton";
import type { TournamentStage } from "@/types/tournament";

export const metadata: Metadata = {
  title: "Fixtures",
  description: "All 2026 FIFA World Cup fixtures — group stage, knockout rounds, and results.",
  alternates: { canonical: "/world-cup/fixtures" },
};

const STAGE_ORDER: TournamentStage[] = [
  "group", "round-of-16", "quarter-final", "semi-final", "final",
];

const STAGE_LABELS: Record<TournamentStage, string> = {
  group: "Group Stage",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-Finals",
  "semi-final": "Semi-Finals",
  final: "Final",
};

// ── Fixture section per stage ─────────────────────────────────────────────────

async function StageFixtures({ stage }: { stage: TournamentStage }) {
  const { fixtures } = await getTournamentFixtures({ stage, pageSize: 50 });
  if (fixtures.length === 0) return null;
  return (
    <section aria-label={STAGE_LABELS[stage]}>
      <h2 className="mb-3 text-base font-black tracking-tight text-zinc-700">
        {STAGE_LABELS[stage]}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fixtures.map((f) => <FixtureCard key={f.id} fixture={f} />)}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorldCupFixturesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Suspense>
        <TournamentNav />
      </Suspense>

      <h1 className="text-2xl font-black tracking-tight">Fixtures</h1>

      {STAGE_ORDER.map((stage) => (
        <Suspense key={stage} fallback={<FixtureListSkeleton />}>
          <StageFixtures stage={stage} />
        </Suspense>
      ))}
    </main>
  );
}
