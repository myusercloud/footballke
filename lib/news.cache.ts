import { cache } from "react";
import newsService from "@/services/news.service";
import type { GetNewsParams } from "@/types/news";

// React cache() deduplicates calls within a single server render pass.
//
// Biggest wins:
//   getArticle   — generateMetadata and page.tsx both call this with the same
//                  slug; without cache() that's two service round-trips.
//   getCategories — same pattern on the listing page.
//
// getNews() takes an object param; React uses reference equality, so two
// separate call-sites constructing { pageSize: 3 } won't deduplicate. This is
// intentional — for the current usage pattern each page calls it only once.
// When moving to a real API, convert params to a stable string key if needed.

export const getArticle = cache((slug: string) =>
  newsService.getNewsBySlug(slug)
);

export const getNews = cache((params: GetNewsParams = {}) =>
  newsService.getNews(params)
);

export const getRelatedNews = cache(
  (slug: string, categorySlug: string, limit?: number) =>
    newsService.getRelatedNews(slug, categorySlug, limit)
);

export const getCategories = cache(() => newsService.getCategories());
