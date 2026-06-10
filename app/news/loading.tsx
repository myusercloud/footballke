import { NewsSkeleton } from "@/components/football/news/NewsSkeleton";

export default function NewsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <NewsSkeleton />
    </main>
  );
}
