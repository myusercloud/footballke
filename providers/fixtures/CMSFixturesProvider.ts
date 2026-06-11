import type { FixturesProvider } from "./FixturesProvider";

// Placeholder for a headless CMS integration (e.g. Sanity, Contentful, Strapi).
// Swap JsonFixturesProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSFixturesProvider implements FixturesProvider {
  async getAllFixtures(): Promise<never> {
    throw new Error("CMSFixturesProvider.getAllFixtures: not implemented");
  }

  async getFixtureById(_id: string): Promise<never> {
    throw new Error("CMSFixturesProvider.getFixtureById: not implemented");
  }

  async getAllCompetitions(): Promise<never> {
    throw new Error("CMSFixturesProvider.getAllCompetitions: not implemented");
  }

  async getAllTeams(): Promise<never> {
    throw new Error("CMSFixturesProvider.getAllTeams: not implemented");
  }

  async getAllVenues(): Promise<never> {
    throw new Error("CMSFixturesProvider.getAllVenues: not implemented");
  }
}
