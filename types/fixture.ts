// ── Primitives ────────────────────────────────────────────────────────────────

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "fulltime"
  | "postponed";

export type TeamColors = {
  primary: string;   // CSS hex, e.g. "#006B2D"
  secondary: string;
};

export type Team = {
  id: string;
  name: string;         // "Gor Mahia FC"
  shortName: string;    // "Gor Mahia"  (for medium-width layouts)
  abbreviation: string; // "GOR"  (3 chars, for compact scoreboards)
  slug: string;
  logo: string;         // absolute path or URL
  colors: TeamColors;
};

export type Competition = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
  season: string; // "2025/26"
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  capacity?: number;
};

// ── Score ─────────────────────────────────────────────────────────────────────

export type HalfTimeScore = {
  home: number;
  away: number;
};

export type Score = {
  home: number;
  away: number;
  halfTime?: HalfTimeScore;
};

// ── Match statistics ──────────────────────────────────────────────────────────

export type TeamStats = {
  possession: number;  // 0–100 (home + away = 100)
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
};

export type MatchStats = {
  home: TeamStats;
  away: TeamStats;
};

// ── Goal event ────────────────────────────────────────────────────────────────

export type GoalEvent = {
  id: string;
  playerName: string;
  playerSlug: string;
  /** Which side the goal counts for (own goals count for the conceding team). */
  team: 'home' | 'away';
  minute: number;
  /** Added time, e.g. 3 for "90+3". */
  addedTime?: number;
  isOwnGoal: boolean;
  isPenalty: boolean;
};

// ── Core entity ───────────────────────────────────────────────────────────────
//
// Fixture is deliberately flat: UI components receive it as-is from the
// service and do not need to reach back into raw data for lookups.
//
// Optional fields follow the status lifecycle:
//   score       — present for live, halftime, fulltime
//   liveMinute  — only meaningful when status === "live"
//   stats       — typically only finalised when status === "fulltime"

export type Fixture = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  competition: Competition;
  venue: Venue;
  kickoff: string;       // ISO 8601 with TZ offset, e.g. "2026-06-14T15:00:00+03:00"
  status: MatchStatus;
  matchday?: number;     // KPL matchweek / cup round number
  score?: Score;
  liveMinute?: number;   // 1–90+ when status === "live"
  stats?: MatchStats;
  homeForm: string[];    // ["W","D","L","W","W"] — index 0 = oldest, last = most recent
  awayForm: string[];
  preview?: string;      // plain-text match preview or post-match summary
  relatedNewsSlugs: string[];
  featured: boolean;
  goalEvents: GoalEvent[];
};

// ── Service params & response ─────────────────────────────────────────────────

export type GetFixturesParams = {
  page?: number;
  pageSize?: number;
  competitionSlug?: string;
  teamSlug?: string;
  /** Single status or array of statuses to include. Omit to include all. */
  status?: MatchStatus | MatchStatus[];
  /** ISO date string "YYYY-MM-DD". Inclusive lower bound on kickoff. */
  dateFrom?: string;
  /** ISO date string "YYYY-MM-DD". Inclusive upper bound on kickoff (full day). */
  dateTo?: string;
};

export type FixtureResponse = {
  fixtures: Fixture[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export interface IFixturesService {
  /** Paginated list with filtering and default smart sort. */
  getFixtures(params?: GetFixturesParams): Promise<FixtureResponse>;
  /** Single fixture by primary key. Returns null when not found. */
  getFixtureById(id: string): Promise<Fixture | null>;
  /** Scheduled fixtures with kickoff >= now, sorted nearest first. */
  getUpcomingFixtures(limit?: number): Promise<Fixture[]>;
  /** Fulltime fixtures, sorted most recent first. */
  getCompletedFixtures(limit?: number): Promise<Fixture[]>;
  /** All fixtures (any status) involving a team, sorted chronologically. */
  getClubFixtures(teamSlug: string, limit?: number): Promise<Fixture[]>;
  /** All competitions in the data set. */
  getCompetitions(): Promise<Competition[]>;
  /** All teams in the data set. */
  getTeams(): Promise<Team[]>;
}
