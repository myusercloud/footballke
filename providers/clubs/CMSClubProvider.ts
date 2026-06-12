import type { ClubProvider } from "./ClubProvider";

// Placeholder for a headless CMS integration (e.g. Sanity, Contentful, Strapi).
// Swap JsonClubProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSClubProvider implements ClubProvider {
  async getAllClubs(): Promise<never> {
    throw new Error("CMSClubProvider.getAllClubs: not implemented");
  }

  async getClubBySlug(_slug: string): Promise<never> {
    throw new Error("CMSClubProvider.getClubBySlug: not implemented");
  }
}
