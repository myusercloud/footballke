import type { Article, Author, Category, ContentBlock } from "@/types/news";
import { calculateReadingTime } from "@/lib/news.utils";
import rawData from "@/data/news.json";
import type { NewsProvider } from "./NewsProvider";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// Mirrors data/news.json exactly. Private to this module — callers only ever
// receive the resolved Article / Category / Author types from types/news.ts.

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
// Resolves normalized IDs to full entities and derives readingTime.
// Identical to the mapper previously embedded in services/news.service.ts.

function mapArticle(raw: RawArticle, data: RawData): Article {
  const author = data.authors.find((a) => a.id === raw.authorId);
  const category = data.categories.find((c) => c.slug === raw.categorySlug);

  if (!author)
    throw new Error(`Author not found: ${raw.authorId} (article: ${raw.slug})`);
  if (!category)
    throw new Error(`Category not found: ${raw.categorySlug} (article: ${raw.slug})`);

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

export class JsonNewsProvider implements NewsProvider {
  private readonly data: RawData = rawData as RawData;

  async getAllArticles(): Promise<Article[]> {
    return this.data.articles.map((raw) => mapArticle(raw, this.data));
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const raw = this.data.articles.find((a) => a.slug === slug);
    return raw ? mapArticle(raw, this.data) : null;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.data.categories;
  }

  async getAllAuthors(): Promise<Author[]> {
    return this.data.authors;
  }
}
