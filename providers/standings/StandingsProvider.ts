import type { Club, Season, StandingsCompetition, ZoneConfig } from "@/types/standings";

// ── Raw provider types ────────────────────────────────────────────────────────
//
// These types describe what the provider returns to the service.
// They are intentionally narrower than StandingRow — no position, no
// goalDifference, no points, no zone.  Those fields are derived by the
// service's buildTable() method and are therefore service concerns, not
// provider concerns.
//
// The `clubId` reference is kept here so the service can use the clubs list
// returned by getAllClubs() to resolve entities during table construction.

export type ProviderStandingRow = {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  /** ["W","D","L","W","W"] — index 0 = oldest, last = most recent */
  form: string[];
};

export type ProviderStandingsEntry = {
  id: string;
  competitionId: string;
  season: Season;
  /** Zone config stored per-table so different competitions can have different rules. */
  zones: ZoneConfig[];
  rows: ProviderStandingRow[];
  /** ISO 8601 timestamp of last data refresh. */
  updatedAt: string;
};

// ── StandingsProvider ─────────────────────────────────────────────────────────
//
// Contract between the service layer and any standings data source.
//
// Responsibilities:
//   - Return raw unranked rows and the lookup tables needed to resolve them.
//   - No position calculation, no zone assignment, no sorting.
//   - Those are exclusively service (buildTable) concerns.
//
// Implementations:
//   JsonStandingsProvider   — reads data/standings.json (current default)
//   CMSStandingsProvider    — reads from a headless CMS (future)
//   APIStandingsProvider    — reads from a sports data provider or REST API (future)

export interface StandingsProvider {
  /**
   * All standings table entries across all competitions and seasons.
   * The service filters by competition/season and builds the final table.
   */
  getAllEntries(): Promise<ProviderStandingsEntry[]>;

  /**
   * All clubs in the data source.
   * The service resolves clubId references during table construction.
   */
  getAllClubs(): Promise<Club[]>;

  /** All competitions that have at least one standings entry. */
  getAllCompetitions(): Promise<StandingsCompetition[]>;
}
