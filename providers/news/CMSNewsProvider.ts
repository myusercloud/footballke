import type { NewsProvider } from "./NewsProvider";

// Placeholder for a headless CMS integration (e.g. Sanity, Contentful, Strapi).
// Swap JsonNewsProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSNewsProvider implements NewsProvider {
  async getAllArticles(): Promise<never> {
    throw new Error("CMSNewsProvider.getAllArticles: not implemented");
  }

  async getArticleBySlug(_slug: string): Promise<never> {
    throw new Error("CMSNewsProvider.getArticleBySlug: not implemented");
  }

  async getAllCategories(): Promise<never> {
    throw new Error("CMSNewsProvider.getAllCategories: not implemented");
  }

  async getAllAuthors(): Promise<never> {
    throw new Error("CMSNewsProvider.getAllAuthors: not implemented");
  }
}
