import type { StandingsProvider } from "./StandingsProvider";

// Placeholder for a sports data API integration (e.g. API-Football, SportMonks).
// Swap JsonStandingsProvider for this class in providers/config.ts once the
// API credentials and response mappings are in place.

export class APIStandingsProvider implements StandingsProvider {
  async getAllEntries(): Promise<never> {
    throw new Error("APIStandingsProvider.getAllEntries: not implemented");
  }

  async getAllClubs(): Promise<never> {
    throw new Error("APIStandingsProvider.getAllClubs: not implemented");
  }

  async getAllCompetitions(): Promise<never> {
    throw new Error("APIStandingsProvider.getAllCompetitions: not implemented");
  }
}
