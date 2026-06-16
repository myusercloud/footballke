import type { Article, Author, Category } from "@/types/news";
import type { NewsProvider } from "./NewsProvider";
import { apiFetch } from "@/providers/api-client";

type ArticleListResponse = { data: Article[]; total: number; page: number; pageSize: number; totalPages: number };

export class APINewsProvider implements NewsProvider {
  async getAllArticles(): Promise<Article[]> {
    // Fetch all pages (page size 100 to minimise round-trips)
    const first = await apiFetch<ArticleListResponse>('/news?page=1&pageSize=100');
    if (first.totalPages <= 1) return first.data;

    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        apiFetch<ArticleListResponse>(`/news?page=${i + 2}&pageSize=100`)
      )
    );
    return [first.data, ...rest.map((r) => r.data)].flat();
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      return await apiFetch<Article>(`/news/${encodeURIComponent(slug)}`);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    return apiFetch<Category[]>('/news/categories');
  }

  async getAllAuthors(): Promise<Author[]> {
    return apiFetch<Author[]>('/news/authors');
  }
}
