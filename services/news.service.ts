import type {
  Article,
  Category,
  GetNewsParams,
  INewsService,
  NewsResponse,
} from "@/types/news";
import type { NewsProvider } from "@/providers/news/NewsProvider";
import { getNewsProvider } from "@/providers/config";

// ── Implementation ────────────────────────────────────────────────────────────

class NewsService implements INewsService {
  constructor(private readonly provider: NewsProvider) {}

  async getNews(params: GetNewsParams = {}): Promise<NewsResponse> {
    const { page = 1, pageSize = 9, categorySlug, featured } = params;

    let filtered = await this.provider.getAllArticles();

    if (categorySlug !== undefined) {
      filtered = filtered.filter((a) => a.category.slug === categorySlug);
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
      articles: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getNewsBySlug(slug: string): Promise<Article | null> {
    return this.provider.getArticleBySlug(slug);
  }

  async getRelatedNews(
    slug: string,
    categorySlug: string,
    limit = 3
  ): Promise<Article[]> {
    const articles = await this.provider.getAllArticles();

    // Primary: same category, excluding current article
    let pool = articles.filter(
      (a) => a.slug !== slug && a.category.slug === categorySlug
    );

    // Fallback: if not enough in the same category, fill from relatedSlugs
    if (pool.length < limit) {
      const current = articles.find((a) => a.slug === slug);
      if (current) {
        const bySlug = articles.filter(
          (a) =>
            current.relatedSlugs.includes(a.slug) &&
            !pool.some((p) => p.slug === a.slug)
        );
        pool = [...pool, ...bySlug];
      }
    }

    return pool
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    return this.provider.getAllCategories();
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To switch backends, set CONTENT_SOURCE in .env.local.
// Provider selection lives in providers/config.ts.

const newsService: INewsService = new NewsService(getNewsProvider());
export default newsService;
