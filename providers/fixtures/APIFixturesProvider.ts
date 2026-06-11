import type { FixturesProvider } from "./FixturesProvider";

// Placeholder for a sports data API integration (e.g. API-Football, SportMonks).
// Swap JsonFixturesProvider for this class in providers/config.ts once the
// API credentials and response mappings are in place.

export class APIFixturesProvider implements FixturesProvider {
  async getAllFixtures(): Promise<never> {
    throw new Error("APIFixturesProvider.getAllFixtures: not implemented");
  }

  async getFixtureById(_id: string): Promise<never> {
    throw new Error("APIFixturesProvider.getFixtureById: not implemented");
  }

  async getAllCompetitions(): Promise<never> {
    throw new Error("APIFixturesProvider.getAllCompetitions: not implemented");
  }

  async getAllTeams(): Promise<never> {
    throw new Error("APIFixturesProvider.getAllTeams: not implemented");
  }

  async getAllVenues(): Promise<never> {
    throw new Error("APIFixturesProvider.getAllVenues: not implemented");
  }
}
