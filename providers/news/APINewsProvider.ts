import type { NewsProvider } from "./NewsProvider";

// Placeholder for a REST/GraphQL news API integration.
// Swap JsonNewsProvider for this class in providers/config.ts once the
// endpoint contracts and authentication are established.

export class APINewsProvider implements NewsProvider {
  async getAllArticles(): Promise<never> {
    throw new Error("APINewsProvider.getAllArticles: not implemented");
  }

  async getArticleBySlug(_slug: string): Promise<never> {
    throw new Error("APINewsProvider.getArticleBySlug: not implemented");
  }

  async getAllCategories(): Promise<never> {
    throw new Error("APINewsProvider.getAllCategories: not implemented");
  }

  async getAllAuthors(): Promise<never> {
    throw new Error("APINewsProvider.getAllAuthors: not implemented");
  }
}
