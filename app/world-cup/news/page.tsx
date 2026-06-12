import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournamentNews } from "@/lib/tournament.cache";
import { TournamentNav } from "@/components/football/world-cup/TournamentNav";
import { NewsCard } from "@/components/football/news/NewsCard";
import { EmptyNewsState } from "@/components/football/news/EmptyNewsState";
import { NewsSkeleton } from "@/components/football/news/NewsSkeleton";

export const metadata: Metadata = {
  title: "News",
  description: "Latest 2026 FIFA World Cup news, analysis, and match reports.",
  alternates: { canonical: "/world-cup/news" },
};

async function NewsList() {
  const articles = await getTournamentNews(20);
  if (articles.length === 0) return <EmptyNewsState />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => <NewsCard key={a.id} article={a} />)}
    </div>
  );
}

export default function WorldCupNewsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Suspense>
        <TournamentNav />
      </Suspense>

      <h1 className="text-2xl font-black tracking-tight">World Cup News</h1>

      <Suspense fallback={<NewsSkeleton />}>
        <NewsList />
      </Suspense>
    </main>
  );
}
