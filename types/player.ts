// ── Position ──────────────────────────────────────────────────────────────────

/** High-level position category — used for squad grouping and filtering. */
export type PositionCategory =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward";

/** Granular playing position label stored on the player record. */
export type Position =
  | "Goalkeeper"
  | "Centre-Back"
  | "Left-Back"
  | "Right-Back"
  | "Wing-Back"
  | "Defensive Midfielder"
  | "Central Midfielder"
  | "Attacking Midfielder"
  | "Left Midfielder"
  | "Right Midfielder"
  | "Striker"
  | "Second Striker"
  | "Left Winger"
  | "Right Winger";

// ── Nationality ───────────────────────────────────────────────────────────────

export type Nationality = {
  name: string;   // "Kenyan"
  code: string;   // ISO 3166-1 alpha-2, e.g. "KE"
  flag: string;   // absolute path or CDN URL
};

// ── Contract ──────────────────────────────────────────────────────────────────

export type Contract = {
  /** ISO date "YYYY-MM-DD". Null when contract details are not disclosed. */
  until: string | null;
  type: "permanent" | "loan";
};

// ── Player statistics ─────────────────────────────────────────────────────────
//
// Current-season figures for the player's active club.
// cleanSheets is meaningful only for goalkeepers; omit for outfield players.

export type PlayerStats = {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  /** Keeper-only. Omit for outfield players. */
  cleanSheets?: number;
};

// ── Core entity ───────────────────────────────────────────────────────────────
//
// First-class player representation. Before this type existed, the only
// player shape was TransferPlayer (name, position, nationality, age) — too
// thin for profile pages or squad displays.
//
// Club association is denormalised: clubId (FK), clubSlug (URL construction),
// and clubName (display without a second lookup) are all stored on the player.
// The service assembles squads by filtering on clubSlug.

export type Player = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: string;             // e.g. "player-nicholas-kipkirui"
  slug: string;           // URL-safe, permanent. e.g. "nicholas-kipkirui"
  name: string;           // "Nicholas Kipkirui"
  jerseyNumber: number;

  // ── Playing profile ───────────────────────────────────────────────────────
  position: Position;
  /** Null if the player does not have a recognized secondary position. */
  secondaryPosition: Position | null;
  nationality: Nationality;
  /** ISO date "YYYY-MM-DD". Null when not publicly available. */
  dateOfBirth: string | null;
  /** Derived from dateOfBirth. Null when dateOfBirth is unknown. */
  age: number | null;
  /** Height in centimetres. */
  height: number;
  preferredFoot: "right" | "left" | "both";

  // ── Club association ──────────────────────────────────────────────────────
  /** Foreign key matching Club.id and Team.id across all modules. */
  clubId: string;
  /** Denormalised for URL construction without a club lookup. */
  clubSlug: string;
  /** Denormalised for display without a club lookup. */
  clubName: string;
  contract: Contract;

  // ── Media ─────────────────────────────────────────────────────────────────
  image: string;          // absolute path or CDN URL

  // ── Current season ────────────────────────────────────────────────────────
  stats: PlayerStats;

  // ── Content ───────────────────────────────────────────────────────────────
  bio: string;            // short plain-text biography

  // ── Search ────────────────────────────────────────────────────────────────
  searchableName: string;
  searchableKeywords: string[]; // surnames, nicknames, position, club name
  searchableSlug: string;
};

// ── Service params & responses ────────────────────────────────────────────────

export type GetPlayersParams = {
  page?: number;
  pageSize?: number;
  /** Filter to a specific club's squad. */
  clubSlug?: string;
  /** Filter by high-level position category. */
  positionCategory?: PositionCategory;
  /** Filter by nationality country code, e.g. "KE". */
  nationality?: string;
  /** Return only editorially-featured players. */
  featured?: boolean;
};

export type PlayerResponse = {
  players: Player[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Service interface ─────────────────────────────────────────────────────────
//
// Contract between the UI layer and any player data source.
// Swap the implementation class in services/player.service.ts to migrate
// JSON → REST API → sports data provider without touching any component or page.

export interface IPlayerService {
  /**
   * Paginated list of players with optional filtering.
   * Default sort: squad number ascending within each club.
   */
  getPlayers(params?: GetPlayersParams): Promise<PlayerResponse>;

  /**
   * Single player by URL slug.
   * Returns null when no player with the given slug exists.
   */
  getPlayerBySlug(slug: string): Promise<Player | null>;

  /**
   * All players for a given club, grouped by position category.
   * Used for squad lists on club profile pages.
   */
  getPlayersByClub(clubSlug: string): Promise<Player[]>;

  /**
   * A curated or stat-ranked selection of players.
   * Used for homepage spotlights and sidebar widgets.
   */
  getFeaturedPlayers(limit?: number): Promise<Player[]>;

  /**
   * Players sharing the same club or position as the given player.
   * Used for "similar players" widgets on player profile pages.
   */
  getRelatedPlayers(slug: string, limit?: number): Promise<Player[]>;
}
