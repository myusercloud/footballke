import type { Fixture, MatchStatus, Score } from "./fixture";
import type { Article } from "./news";
import type { Position, Nationality } from "./player";

// ── Re-exports for consumer convenience ──────────────────────────────────────
// Pages and components import these directly from this module so they don't
// need to import from multiple type files.
export type { Fixture, Article };

// ── Stage ─────────────────────────────────────────────────────────────────────

export type TournamentStage =
  | "group"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "final";

// ── Team ─────────────────────────────────────────────────────────────────────

export type Confederation =
  | "CAF"
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "AFC"
  | "OFC";

export type TournamentTeam = {
  id: string;
  slug: string;
  name: string;             // "Kenya"
  shortName: string;        // "Kenya"
  abbreviation: string;     // "KEN"
  flag: string;             // path or CDN URL, e.g. "/flags/ke.svg"
  colors: {
    primary: string;        // CSS hex
    secondary: string;
  };
  confederation: Confederation;
  fifaRanking: number;
  groupLetter?: string;     // "A" – "H", set when groups are drawn
};

// ── Player ────────────────────────────────────────────────────────────────────

export type TournamentPlayerStats = {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  cleanSheets?: number;     // GKs only
};

export type TournamentPlayer = {
  id: string;
  slug: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  secondaryPosition: Position | null;
  nationality: Nationality;
  dateOfBirth: string;      // ISO "YYYY-MM-DD"
  /** Derived at read time — never stored in JSON. */
  age: number;
  height: number;           // centimetres
  preferredFoot: "right" | "left" | "both";
  team: TournamentTeam;
  image: string;
  stats: TournamentPlayerStats;
  bio: string;
  searchableName: string;
  searchableKeywords: string[];
  searchableSlug: string;
};

// ── Top Scorer ────────────────────────────────────────────────────────────────

export type TopScorer = {
  rank: number;
  playerSlug: string;
  playerName: string;
  team: TournamentTeam;
  goals: number;
  assists: number;
  appearances: number;
};

// ── Group ─────────────────────────────────────────────────────────────────────

export type GroupLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type TournamentGroup = {
  letter: GroupLetter;
  teams: TournamentTeam[];
};

// ── Standings ─────────────────────────────────────────────────────────────────

export type TournamentStandingStatus = "qualified" | "eliminated" | "tbd";

export type TournamentStanding = {
  position: number;
  team: TournamentTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];           // ["W","D","L"] — most recent last
  status: TournamentStandingStatus;
};

export type GroupStandingsTable = {
  group: TournamentGroup;
  rows: TournamentStanding[];
};

// ── Knockout ──────────────────────────────────────────────────────────────────

export type KnockoutMatch = {
  id: string;
  stage: TournamentStage;
  team1: TournamentTeam | null;   // null = TBD (winner of previous round)
  team2: TournamentTeam | null;
  score?: Score;
  winner?: TournamentTeam;
  kickoff?: string;               // ISO 8601
  venue?: string;
  status: MatchStatus;
  label?: string;                 // "Match 49", "QF1", etc.
};

export type KnockoutRound = {
  stage: TournamentStage;
  matches: KnockoutMatch[];
};

// ── Tournament ────────────────────────────────────────────────────────────────

export type TournamentVenue = {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
};

export type Tournament = {
  id: string;
  slug: string;
  name: string;             // "2026 FIFA World Cup"
  shortName: string;        // "World Cup 2026"
  edition: string;          // "23rd"
  host: {
    countries: string[];    // ["USA", "Canada", "Mexico"]
    cities: string[];
    venues: TournamentVenue[];
  };
  dates: {
    start: string;          // ISO "YYYY-MM-DD"
    end: string;
    groupStageEnd?: string;
    knockoutStart?: string;
  };
  currentPhase: TournamentStage;
  emblem: string;
  groups: TournamentGroup[];
  totalTeams: number;
  featured: boolean;
};

// ── Service params & responses ────────────────────────────────────────────────

export type GetTournamentFixturesParams = {
  groupLetter?: GroupLetter;
  stage?: TournamentStage;
  teamSlug?: string;
  status?: MatchStatus | MatchStatus[];
  page?: number;
  pageSize?: number;
};

export type TournamentFixtureResponse = {
  fixtures: Fixture[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Service interface ─────────────────────────────────────────────────────────

export interface ITournamentService {
  getTournament(): Promise<Tournament>;
  getGroups(): Promise<TournamentGroup[]>;
  getGroupStandings(groupLetter?: GroupLetter): Promise<GroupStandingsTable[]>;
  getKnockoutRounds(): Promise<KnockoutRound[]>;
  getFixtures(params?: GetTournamentFixturesParams): Promise<TournamentFixtureResponse>;
  getTopScorers(limit?: number): Promise<TopScorer[]>;
  getFeaturedPlayers(limit?: number): Promise<TournamentPlayer[]>;
  getTeamBySlug(slug: string): Promise<TournamentTeam | null>;
  getPlayerBySlug(slug: string): Promise<TournamentPlayer | null>;
  getLatestNews(limit?: number): Promise<Article[]>;
}
