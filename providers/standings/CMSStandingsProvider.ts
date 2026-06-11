import type { StandingsProvider } from "./StandingsProvider";

// Placeholder for a headless CMS integration (e.g. Sanity, Contentful, Strapi).
// Swap JsonStandingsProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSStandingsProvider implements StandingsProvider {
  async getAllEntries(): Promise<never> {
    throw new Error("CMSStandingsProvider.getAllEntries: not implemented");
  }

  async getAllClubs(): Promise<never> {
    throw new Error("CMSStandingsProvider.getAllClubs: not implemented");
  }

  async getAllCompetitions(): Promise<never> {
    throw new Error("CMSStandingsProvider.getAllCompetitions: not implemented");
  }
}
