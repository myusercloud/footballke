import type { Article, Author, Category } from "@/types/news";

// ── NewsProvider ──────────────────────────────────────────────────────────────
//
// Contract between the service layer and any news data source.
//
// Responsibilities:
//   - Return fully-resolved domain objects (Author and Category already joined,
//     readingTime already calculated).
//   - No filtering, no sorting, no pagination — those are service concerns.
//
// Implementations:
//   JsonNewsProvider   — reads data/news.json (current default)
//   CMSNewsProvider    — reads from a headless CMS (future)
//   APINewsProvider    — reads from a REST API (future)

export interface NewsProvider {
  /**
   * All articles, fully resolved.
   * The service filters and paginates this list.
   */
  getAllArticles(): Promise<Article[]>;

  /**
   * Single article by slug.
   * Providers that support targeted lookups (API, CMS) can optimise this
   * into a single network request rather than loading all articles.
   * Returns null when no article with the given slug exists.
   */
  getArticleBySlug(slug: string): Promise<Article | null>;

  /** All categories defined in the data source. */
  getAllCategories(): Promise<Category[]>;

  /** All authors defined in the data source. */
  getAllAuthors(): Promise<Author[]>;
}
