import type { Metadata } from "next";
import { getNews, getCategories } from "@/lib/news.cache";
import { HeroArticle } from "@/components/football/news/HeroArticle";
import { NewsGrid } from "@/components/football/news/NewsGrid";
import { CategoryFilter } from "@/components/football/news/CategoryFilter";
import { Pagination } from "@/components/football/news/Pagination";
import { EmptyNewsState } from "@/components/football/news/EmptyNewsState";

// ── Metadata ─────────────────────────────────────────────────────────────────

type PageProps = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category } = await searchParams;

  if (category) {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === category);
    if (cat) {
      return {
        title: cat.name,
        description: `Latest ${cat.name.toLowerCase()} from the Kenyan Premier League on FootballKE.`,
        openGraph: {
          title: `${cat.name} — FootballKE`,
          description: `Latest ${cat.name.toLowerCase()} from the Kenyan Premier League.`,
        },
      };
    }
  }

  return {
    title: "News",
    description:
      "Latest Kenyan Premier League news — match reports, transfers, analysis, and opinion.",
    openGraph: {
      title: "KPL News — FootballKE",
      description:
        "Latest Kenyan Premier League news — match reports, transfers, analysis, and opinion.",
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9;

export default async function NewsPage({ searchParams }: PageProps) {
  // Next.js 16: searchParams is a Promise — must await
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ articles, total, totalPages }, categories] = await Promise.all([
    getNews({ page, pageSize: PAGE_SIZE, categorySlug: category }),
    getCategories(),
  ]);

  const [hero, ...rest] = articles;
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : "Latest News"}
        </h1>
        {total > 0 && (
          <p className="shrink-0 text-sm text-zinc-500">
            {total} article{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Category filter */}
      <CategoryFilter categories={categories} currentSlug={category ?? null} />

      {/* Content */}
      {articles.length === 0 ? (
        <div className="mt-5">
          <EmptyNewsState categoryName={activeCategory?.name} />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {hero && <HeroArticle article={hero} />}
          {rest.length > 0 && <NewsGrid articles={rest} />}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              categorySlug={category}
            />
          )}
        </div>
      )}
    </main>
  );
}
