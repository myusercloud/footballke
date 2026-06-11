import type { Competition, Fixture, Team, Venue } from "@/types/fixture";

// ── FixturesProvider ──────────────────────────────────────────────────────────
//
// Contract between the service layer and any fixtures data source.
//
// Responsibilities:
//   - Return fully-resolved Fixture objects (Team, Competition, and Venue
//     entities already joined — no raw ID references exposed).
//   - No filtering by status, competition, date range, or team.
//   - No sorting or pagination.
//
// Implementations:
//   JsonFixturesProvider   — reads data/fixtures.json (current default)
//   CMSFixturesProvider    — reads from a headless CMS (future)
//   APIFixturesProvider    — reads from a sports data provider or REST API (future)

export interface FixturesProvider {
  /**
   * All fixtures, fully resolved.
   * The service applies status/competition/date/team filters and pagination.
   */
  getAllFixtures(): Promise<Fixture[]>;

  /**
   * Single fixture by primary key.
   * Allows providers backed by a real API to issue a targeted request.
   * Returns null when no fixture with the given id exists.
   */
  getFixtureById(id: string): Promise<Fixture | null>;

  /** All competitions present in the data source. */
  getAllCompetitions(): Promise<Competition[]>;

  /** All teams present in the data source. */
  getAllTeams(): Promise<Team[]>;

  /** All venues present in the data source. */
  getAllVenues(): Promise<Venue[]>;
}
