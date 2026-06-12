// ── Primitives ────────────────────────────────────────────────────────────────

export type ClubColors = {
  primary: string;   // CSS hex, e.g. "#006B2D"
  secondary: string;
};

export type ClubVenue = {
  id: string;
  name: string;
  city: string;
  capacity?: number;
};

export type ClubSocial = {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
};

// ── Club statistics ───────────────────────────────────────────────────────────
//
// Snapshot of the club's current-season KPL standings stats.
// Denormalised here so the club profile renders without a standings query.
// The canonical live figures always come from standings.json / StandingsService.

export type ClubStats = {
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  /** Derived: goalsFor − goalsAgainst */
  goalDifference: number;
  points: number;
  /** ["W","D","L","W","W"] — index 0 = oldest, last = most recent */
  form: string[];
};

// ── Core entity ───────────────────────────────────────────────────────────────
//
// The canonical full representation of a club.
//
// Existing lightweight shadow types (Team in fixture.ts, Club in standings.ts,
// TransferClub in transfer.ts) carry a subset of these fields and are NOT
// replaced — they remain the shapes their own modules pass to their UI.
//
// Cross-referencing: Club.id matches Team.id in fixtures and Club.id in
// standings.json, so lookups work without data migration.

export type Club = {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** Stable primary key. Matches Team.id in fixtures and Club.id in standings. */
  id: string;
  /** URL-safe slug, permanent. e.g. "gor-mahia" */
  slug: string;
  name: string;          // "Gor Mahia FC"
  shortName: string;     // "Gor Mahia"   (medium-width layouts)
  abbreviation: string;  // "GOR"          (3 chars, compact scoreboards)

  // ── Visual ────────────────────────────────────────────────────────────────
  logo: string;          // absolute path or CDN URL
  colors: ClubColors;

  // ── Profile ───────────────────────────────────────────────────────────────
  founded: number;       // year, e.g. 1968
  city: string;
  country: string;       // e.g. "Kenya"
  venue: ClubVenue;
  description: string;   // plain-text bio
  achievements: string[]; // e.g. ["KPL Champions 2024", "FKF Cup 2022"]
  social: ClubSocial;

  // ── Current season ────────────────────────────────────────────────────────
  stats: ClubStats;

  // ── Search ────────────────────────────────────────────────────────────────
  // Populated now so a future search provider can index without schema changes.
  searchableName: string;
  searchableKeywords: string[]; // nicknames, former names, abbreviations
  searchableSlug: string;
};

// ── Service params & responses ────────────────────────────────────────────────

export type GetClubsParams = {
  page?: number;
  pageSize?: number;
  /** Filter clubs whose city matches this value. */
  city?: string;
  /** Return only editorially-featured clubs (e.g. homepage spotlight). */
  featured?: boolean;
  /** Client-side search hint — service filters by name/keywords/slug. */
  search?: string;
};

export type ClubResponse = {
  clubs: Club[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Service interface ─────────────────────────────────────────────────────────
//
// Contract between the UI layer and any club data source.
// Swap the implementation class in services/club.service.ts to migrate
// JSON → REST API → sports data provider without touching any component or page.

export interface IClubService {
  /**
   * Paginated list of clubs with optional filtering.
   * Default sort: current standings position ascending.
   */
  getClubs(params?: GetClubsParams): Promise<ClubResponse>;

  /**
   * Single club by URL slug.
   * Returns null when no club with the given slug exists.
   */
  getClubBySlug(slug: string): Promise<Club | null>;

  /**
   * A curated or points-ranked selection of clubs.
   * Used for homepage spotlights and sidebar widgets.
   */
  getFeaturedClubs(limit?: number): Promise<Club[]>;

  /**
   * Clubs that share the same city or competition as the given club.
   * Used for "other clubs" widgets on club profile pages.
   */
  getRelatedClubs(slug: string, limit?: number): Promise<Club[]>;
}
