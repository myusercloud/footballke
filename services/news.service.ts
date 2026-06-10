import type {
Article,
Author,
Category,
ContentBlock,
GetNewsParams,
INewsService,
NewsResponse,
} from "@/types/news";
import { calculateReadingTime } from "@/lib/news.utils";
import rawData from "@/data/news.json";

// ── Internal JSON shape ───────────────────────────────────────────────────────
// Matches data/news.json exactly. Kept private to this module — UI never sees
// the raw shape, only the mapped Article type from types/news.ts.

type RawArticle = {
id: string;
slug: string;
title: string;
excerpt: string;
content: ContentBlock[];
coverImage: Article["coverImage"];
authorId: string;
categorySlug: string;
tags: string[];
publishedAt: string;
updatedAt?: string;
featured: boolean;
relatedSlugs: string[];
};

type RawData = {
categories: Category[];
authors: Author[];
articles: RawArticle[];
};

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapArticle(raw: RawArticle, data: RawData): Article {
const author = data.authors.find((a) => a.id === raw.authorId);
const category = data.categories.find((c) => c.slug === raw.categorySlug);

if (!author) throw new Error(`Author not found: ${raw.authorId} (article: ${raw.slug})`);
if (!category) throw new Error(`Category not found: ${raw.categorySlug} (article: ${raw.slug})`);

return {
  id: raw.id,
  slug: raw.slug,
  title: raw.title,
  excerpt: raw.excerpt,
  content: raw.content,
  coverImage: raw.coverImage,
  author,
  category,
  tags: raw.tags,
  publishedAt: raw.publishedAt,
  updatedAt: raw.updatedAt,
  featured: raw.featured,
  relatedSlugs: raw.relatedSlugs,
  readingTime: calculateReadingTime(raw.content),
};
}

// ── Implementation ────────────────────────────────────────────────────────────

class JsonNewsService implements INewsService {
private readonly data: RawData = rawData as RawData;

async getNews(params: GetNewsParams = {}): Promise<NewsResponse> {
  const { page = 1, pageSize = 9, categorySlug, featured } = params;

  let filtered = this.data.articles as RawArticle[];

  if (categorySlug !== undefined) {
    filtered = filtered.filter((a) => a.categorySlug === categorySlug);
  }
  if (featured !== undefined) {
    filtered = filtered.filter((a) => a.featured === featured);
  }

  // Newest first
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  return {
    articles: paginated.map((a) => mapArticle(a, this.data)),
    total,
    page,
    pageSize,
    totalPages,
  };
}

async getNewsBySlug(slug: string): Promise<Article | null> {
  const raw = (this.data.articles as RawArticle[]).find(
    (a) => a.slug === slug
  );
  return raw ? mapArticle(raw, this.data) : null;
}

async getRelatedNews(
  slug: string,
  categorySlug: string,
  limit = 3
): Promise<Article[]> {
  // Primary: same category, excluding current article
  let pool = (this.data.articles as RawArticle[]).filter(
    (a) => a.slug !== slug && a.categorySlug === categorySlug
  );

  // Fallback: if not enough in the same category, fill from relatedSlugs
  if (pool.length < limit) {
    const current = (this.data.articles as RawArticle[]).find(
      (a) => a.slug === slug
    );
    if (current) {
      const bySlug = (this.data.articles as RawArticle[]).filter(
        (a) => current.relatedSlugs.includes(a.slug) && !pool.some((p) => p.slug === a.slug)
      );
      pool = [...pool, ...bySlug];
    }
  }

  return pool
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit)
    .map((a) => mapArticle(a, this.data));
}

async getCategories(): Promise<Category[]> {
  return this.data.categories;
}
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To swap implementations (Sanity, REST API, etc.),
// change only the line below — nothing else in the codebase changes.

const newsService: INewsService = new JsonNewsService();
export default newsService;
