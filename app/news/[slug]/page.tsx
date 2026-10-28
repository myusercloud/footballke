import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getNews, getRelatedNews } from "@/lib/news.cache";
import { ArticleHeader } from "@/components/football/news/ArticleHeader";
import { ArticleContent } from "@/components/football/news/ArticleContent";
import { ArticleMeta } from "@/components/football/news/ArticleMeta";
import { RelatedArticles } from "@/components/football/news/RelatedArticles";
import { ShareButtons } from "@/components/football/news/ShareButtons";
import { calculateWordCount } from "@/lib/news.utils";
import type { Article, ArticleEvent } from "@/types/news";

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

  const articleUrl = `${BASE_URL}/news/${slug}`;
  const coverUrl = `${BASE_URL}/news/${slug}/opengraph-image`;
  const section = article.category.name;

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name }],
    keywords: article.tags,
    category: section,
    alternates: {
      canonical: `/news/${slug}`,
    },
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
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: articleUrl,
      siteName: "FootballKE",
      locale: "en_KE",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
      section,
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

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const EVENT_STATUS: Record<
  NonNullable<ArticleEvent["status"]>,
  string
> = {
  scheduled: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
};

function buildJsonLd(article: Article, slug: string) {
  const articleUrl = `${BASE_URL}/news/${slug}`;
  const imageUrl = `${BASE_URL}/news/${slug}/opengraph-image`;
  const event = article.event;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "NewsArticle",
      "@id": `${articleUrl}#article`,
      headline: article.title,
      description: article.excerpt,
      image: [imageUrl],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: {
        "@type": "Person",
        name: article.author.name,
        jobTitle: article.author.role,
      },
      publisher: { "@id": `${BASE_URL}/#organization` },
      mainEntityOfPage: { "@id": `${articleUrl}#webpage` },
      isPartOf: { "@id": `${BASE_URL}/#website` },
      inLanguage: "en-KE",
      articleSection: article.category.name,
      keywords: article.tags.join(", "),
      wordCount: calculateWordCount(article.content),
      timeRequired: `PT${article.readingTime}M`,
      isAccessibleForFree: true,
      ...(event
        ? {
            about: { "@id": `${articleUrl}#event` },
            mentions: [
              { "@type": "SportsTeam", name: event.homeTeam, sport: "Soccer" },
              { "@type": "SportsTeam", name: event.awayTeam, sport: "Soccer" },
            ],
          }
        : {}),
    },
    {
      "@type": "WebPage",
      "@id": `${articleUrl}#webpage`,
      url: articleUrl,
      name: article.title,
      description: article.excerpt,
      isPartOf: { "@id": `${BASE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: imageUrl,
        width: 1200,
        height: 630,
      },
      breadcrumb: { "@id": `${articleUrl}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${articleUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "News",
          item: `${BASE_URL}/news`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.category.name,
          item: `${BASE_URL}/news?category=${article.category.slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: article.title,
          item: articleUrl,
        },
      ],
    },
  ];

  if (event) {
    graph.push({
      "@type": "SportsEvent",
      "@id": `${articleUrl}#event`,
      name: event.name,
      description: article.excerpt,
      startDate: event.startDate,
      ...(event.endDate ? { endDate: event.endDate } : {}),
      eventStatus:
        EVENT_STATUS[event.status ?? "scheduled"],
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      sport: "Soccer",
      url: articleUrl,
      location: {
        "@type": "SportsActivityLocation",
        name: event.venue.name,
        ...(event.venue.capacity
          ? { maximumAttendeeCapacity: event.venue.capacity }
          : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: event.venue.addressLocality,
          addressCountry: event.venue.addressCountry,
        },
      },
      homeTeam: {
        "@type": "SportsTeam",
        name: event.homeTeam,
        sport: "Soccer",
      },
      awayTeam: {
        "@type": "SportsTeam",
        name: event.awayTeam,
        sport: "Soccer",
      },
      ...(event.organizer
        ? {
            organizer: {
              "@type": "Organization",
              name: event.organizer,
            },
          }
        : {}),
      ...(event.ticketUrl
        ? {
            offers: {
              "@type": "Offer",
              url: event.ticketUrl,
              availability: "https://schema.org/PreSale",
              ...(event.ticketSalesStart
                ? { availabilityStarts: event.ticketSalesStart }
                : {}),
            },
          }
        : {}),
      ...(event.broadcast?.length
        ? {
            broadcastOfEvent: event.broadcast.map((name) => ({
              "@type": "BroadcastEvent",
              name: `${event.name} on ${name}`,
              isLiveBroadcast: true,
              startDate: event.startDate,
            })),
          }
        : {}),
    });
  }

  if (article.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${articleUrl}#faq`,
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
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
  const jsonLd = buildJsonLd(article, slug);

  return (
    <>
      {/* JSON-LD injected into <head> by Next.js */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <article>
          {/* Header: breadcrumb + title + author meta + cover image */}
          <ArticleHeader article={article} />

          {/* Prose: rich content + share + author card */}
          <div className="mx-auto mt-8 max-w-2xl">
            <ArticleContent blocks={article.content} />

            {article.faq?.length ? (
              <section
                aria-labelledby="faq-heading"
                className="mt-10 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2
                  id="faq-heading"
                  className="text-xl font-black tracking-tight text-zinc-950"
                >
                  Frequently asked questions
                </h2>
                <dl className="mt-4 divide-y divide-zinc-100">
                  {article.faq.map((item) => (
                    <div key={item.question} className="py-4 first:pt-0 last:pb-0">
                      <dt className="text-sm font-bold text-zinc-900">
                        {item.question}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-7 text-zinc-600">
                        {item.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

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
