import type { Metadata } from "next";
import { Suspense } from "react";
import { getGroupStandings } from "@/lib/tournament.cache";
import { GroupStandings } from "@/components/football/world-cup/GroupStandings";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";

export const metadata: Metadata = {
  title: "Groups",
  description: "2026 FIFA World Cup group stage standings — all 8 groups with live points, goal differences, and qualification status.",
  alternates: { canonical: "/world-cup/groups" },
};

export default async function WorldCupGroupsPage() {
  const tables = await getGroupStandings();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Suspense>
        <TournamentNav />
      </Suspense>

      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-black tracking-tight">Groups</h1>
        <p className="text-sm text-zinc-500">{tables.length} groups · 4 teams each</p>
      </div>

      <GroupStandings tables={tables} />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Qualified
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" aria-hidden="true" />
          TBD
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
          Eliminated
        </span>
        <span className="ml-auto">Pts = Points · GD = Goal Difference</span>
      </div>
    </main>
  );
}
