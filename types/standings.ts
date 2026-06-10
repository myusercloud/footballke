// ── Zone classification ───────────────────────────────────────────────────────
//
// "midtable" is never stored in ZoneConfig — positions not covered by any
// zone entry default to null on StandingRow, which the UI renders as mid-table.

export type TableZone =
  | "champions"
  | "continental"
  | "continental-playoff"
  | "relegation";

// ── Club ─────────────────────────────────────────────────────────────────────
//
// Narrower than types/fixture.ts Team — standings display does not need
// abbreviation, venue, or match-level fields.
// IDs match fixture team IDs so cross-referencing works when a real API arrives.

export type Club = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  colors: {
    primary: string;   // CSS hex, e.g. "#006B2D"
    secondary: string;
  };
};

// ── Competition ───────────────────────────────────────────────────────────────

export type StandingsCompetition = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
};

// ── Season ────────────────────────────────────────────────────────────────────

export type Season = {
  id: string;     // URL-safe slug — "2025-26"
  label: string;  // Display label — "2025/26"
};

// ── Zone config ───────────────────────────────────────────────────────────────
//
// Stored in standings.json per table entry, not hardcoded in the service.
// This lets different competitions carry different zone rules (e.g. a cup
// competition has no relegation) without any code changes.

export type ZoneConfig = {
  from: number;   // inclusive start position
  to: number;     // inclusive end position
  type: TableZone;
  label: string;  // "Champions", "CAF Champions League", "Relegation", …
};

// ── Standing row ──────────────────────────────────────────────────────────────
//
// Fully computed type — the service derives position, points, goalDifference,
// and zone from raw JSON stats. UI components receive only this flat shape.

export type StandingRow = {
  /** True league position from the canonical sort (points → GD → GF → name). */
  position: number;
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  /** Derived: goalsFor − goalsAgainst */
  goalDifference: number;
  /** Derived: won × 3 + drawn */
  points: number;
  /** ["W","D","L","W","W"] — index 0 = oldest, last = most recent */
  form: string[];
  /** null = mid-table (no zone designation for this position). */
  zone: TableZone | null;
};

// ── Full table ────────────────────────────────────────────────────────────────

export type StandingsTable = {
  id: string;                       // "kpl-2025-26"
  competition: StandingsCompetition;
  season: Season;
  zones: ZoneConfig[];
  /** Rows are pre-sorted by the requested sortBy field (default: position). */
  rows: StandingRow[];
  /** ISO 8601 timestamp of last data refresh. */
  updatedAt: string;
};

// ── Sort field ────────────────────────────────────────────────────────────────

export type StandingsSortField =
  | "position"
  | "points"
  | "goalDifference"
  | "goalsFor";

// ── Service params ────────────────────────────────────────────────────────────

export type GetStandingsParams = {
  /** Filter to a specific competition, e.g. "kpl" or "fkf-cup". */
  competitionSlug?: string;
  /** Filter to a specific season by ID slug, e.g. "2025-26". */
  season?: string;
  /** Re-order the returned rows. Canonical positions are always preserved. */
  sortBy?: StandingsSortField;
};

// ── Service responses ─────────────────────────────────────────────────────────

export type StandingsResponse = {
  table: StandingsTable;
  /** All seasons with data for this competition — for the season filter. */
  availableSeasons: Season[];
  /** All competitions with standings data — for the competition filter. */
  availableCompetitions: StandingsCompetition[];
};

// ── Service interface ─────────────────────────────────────────────────────────
//
// IStandingsService is the contract between the UI layer and any data source.
// Replace the implementation class in services/standings.service.ts to migrate
// JSON → REST API → sports data provider without touching any component or page.

export interface IStandingsService {
  /**
   * Full standings table with the contextual data needed to render filters.
   * Returns null if no matching entry is found (e.g. unknown competition slug).
   * With no params, returns the most recently updated table.
   */
  getStandings(params?: GetStandingsParams): Promise<StandingsResponse | null>;

  /**
   * A single club's row within a competition's current (or specified) season.
   * Useful for club profile widgets. Returns null when not found.
   */
  getClubStanding(
    clubSlug: string,
    competitionSlug?: string,
    season?: string
  ): Promise<StandingRow | null>;

  /**
   * Full standings table for a specific competition, without the filter context.
   * Use this for embeddable widgets that don't need available-seasons metadata.
   */
  getCompetitionStandings(
    competitionSlug: string,
    season?: string
  ): Promise<StandingsTable | null>;

  /** All seasons that have standings data, optionally scoped to a competition. */
  getSeasons(competitionSlug?: string): Promise<Season[]>;

  /**
   * ISO timestamp of the most recent data update.
   * Returns null when no matching entry is found.
   */
  getLastUpdated(competitionSlug?: string, season?: string): Promise<string | null>;

  /** All competitions that have at least one standings entry. */
  getCompetitions(): Promise<StandingsCompetition[]>;
}
