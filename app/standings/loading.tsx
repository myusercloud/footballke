import { StandingsSkeleton } from "@/components/football/standings/StandingsSkeleton";

export default function StandingsLoading() {
  return (
    <main className="flex-1 px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <StandingsSkeleton />
      </div>
    </main>
  );
}
