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
        keywords: [cat.name, "KPL", "Kenyan football", "FootballKE"],
        category: cat.name,
        alternates: { canonical: `/news?category=${cat.slug}` },
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
        openGraph: {
          title: `${cat.name} — FootballKE`,
          description: `Latest ${cat.name.toLowerCase()} from the Kenyan Premier League.`,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
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
    keywords: [
      "KPL news",
      "Kenyan football news",
      "Kenyan Premier League",
      "Gor Mahia",
      "AFC Leopards",
      "Tusker FC",
      "FootballKE",
    ],
    category: "Sports News",
    alternates: { canonical: "/news" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: "KPL News — FootballKE",
      description:
        "Latest Kenyan Premier League news — match reports, transfers, analysis, and opinion.",
      type: "website",
      url: "https://footballke.site/news",
    },
    twitter: {
      card: "summary_large_image",
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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: activeCategory
      ? `${activeCategory.name} — FootballKE`
      : "Latest Kenyan football news — FootballKE",
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://footballke.site/news/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
