import { FixtureListSkeleton } from "@/components/football/world-cup/WorldCupSkeleton";

export default function WorldCupFixturesLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="h-10 animate-pulse rounded-sm bg-zinc-100" />
      <div className="h-8 w-32 animate-pulse rounded-sm bg-zinc-200" />
      <FixtureListSkeleton />
    </main>
  );
}
