import { ClubCardSkeleton } from "@/components/football/clubs/ClubSkeleton";

export default function ClubsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-9 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
