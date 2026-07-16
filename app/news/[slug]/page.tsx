import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getNews, getRelatedNews } from "@/lib/news.cache";
import { ArticleHeader } from "@/components/football/news/ArticleHeader";
import { ArticleContent } from "@/components/football/news/ArticleContent";
import { ArticleMeta } from "@/components/football/news/ArticleMeta";
import { RelatedArticles } from "@/components/football/news/RelatedArticles";
import { ShareButtons } from "@/components/football/news/ShareButtons";

const BASE_URL = "https://footballke.site";

// Unmatched slugs return 404 at runtime instead of attempting a render
export const dynamicParams = false;

// ── Static params — pre-renders all articles at build time ────────────────────

export async function generateStaticParams() {
  const { articles } = await getNews({ pageSize: 100 });
  return articles.map(({ slug }) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return {};

  const coverUrl = `${BASE_URL}${article.coverImage.src}`;

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name }],
    keywords: article.tags,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `${BASE_URL}/news/${slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
      images: [
        {
          url: coverUrl,
          width: article.coverImage.width,
          height: article.coverImage.height,
          alt: article.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [coverUrl],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: PageProps) {
  // Next.js 16: params is a Promise — must await
  const { slug } = await params;

  const article = await getArticle(slug);

  // notFound() has return type `never` — TypeScript narrows article to Article below
  if (!article) notFound();

  const relatedArticles = await getRelatedNews(slug, article.category.slug);

  const articleUrl = `${BASE_URL}/news/${slug}`;

  // Schema.org NewsArticle JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [`${BASE_URL}${article.coverImage.src}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "FootballKE",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/trophy.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: article.tags.join(", "),
    articleSection: article.category.name,
  };

  return (
    <>
      {/* JSON-LD injected into <head> by Next.js */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <article>
          {/* Header: breadcrumb + title + author meta + cover image */}
          <ArticleHeader article={article} />

          {/* Prose: rich content + share + author card */}
          <div className="mx-auto mt-8 max-w-2xl">
            <ArticleContent blocks={article.content} />

            <div className="mt-10 space-y-6 border-t border-zinc-200 pt-6">
              <ShareButtons title={article.title} url={articleUrl} />
              <ArticleMeta article={article} />
            </div>
          </div>
        </article>

        {/* Related articles — full container width */}
        {relatedArticles.length > 0 && (
          <div className="mt-14 border-t border-zinc-200 pt-8">
            <RelatedArticles articles={relatedArticles} />
          </div>
        )}
      </main>
    </>
  );
}
