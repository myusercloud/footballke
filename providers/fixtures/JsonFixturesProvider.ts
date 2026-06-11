import type {
  Competition,
  Fixture,
  MatchStats,
  MatchStatus,
  Score,
  Team,
  Venue,
} from "@/types/fixture";
import rawData from "@/data/fixtures.json";
import type { FixturesProvider } from "./FixturesProvider";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// Mirrors data/fixtures.json exactly. Private to this module — callers only
// ever receive the resolved Fixture type from types/fixture.ts.

type RawFixture = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  venueId: string;
  kickoff: string;
  status: MatchStatus;
  matchday?: number;
  score?: Score;
  liveMinute?: number;
  stats?: MatchStats;
  homeForm: string[];
  awayForm: string[];
  preview?: string;
  relatedNewsSlugs: string[];
  featured: boolean;
};

type RawData = {
  teams: Team[];
  competitions: Competition[];
  venues: Venue[];
  fixtures: RawFixture[];
};

// ── Mapper ────────────────────────────────────────────────────────────────────
// Resolves four normalized ID references (homeTeam, awayTeam, competition,
// venue) into their full entities.
// Identical to the mapper previously embedded in services/fixtures.service.ts.

function mapFixture(raw: RawFixture, data: RawData): Fixture {
  const homeTeam = data.teams.find((t) => t.id === raw.homeTeamId);
  const awayTeam = data.teams.find((t) => t.id === raw.awayTeamId);
  const competition = data.competitions.find((c) => c.id === raw.competitionId);
  const venue = data.venues.find((v) => v.id === raw.venueId);

  if (!homeTeam)
    throw new Error(`Home team not found: ${raw.homeTeamId} (fixture: ${raw.id})`);
  if (!awayTeam)
    throw new Error(`Away team not found: ${raw.awayTeamId} (fixture: ${raw.id})`);
  if (!competition)
    throw new Error(`Competition not found: ${raw.competitionId} (fixture: ${raw.id})`);
  if (!venue)
    throw new Error(`Venue not found: ${raw.venueId} (fixture: ${raw.id})`);

  return {
    id: raw.id,
    homeTeam,
    awayTeam,
    competition,
    venue,
    kickoff: raw.kickoff,
    status: raw.status,
    matchday: raw.matchday,
    score: raw.score,
    liveMinute: raw.liveMinute,
    stats: raw.stats,
    homeForm: raw.homeForm,
    awayForm: raw.awayForm,
    preview: raw.preview,
    relatedNewsSlugs: raw.relatedNewsSlugs,
    featured: raw.featured,
  };
}

// ── Implementation ────────────────────────────────────────────────────────────

export class JsonFixturesProvider implements FixturesProvider {
  private readonly data: RawData = rawData as RawData;

  async getAllFixtures(): Promise<Fixture[]> {
    return this.data.fixtures.map((raw) => mapFixture(raw, this.data));
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    const raw = this.data.fixtures.find((f) => f.id === id);
    return raw ? mapFixture(raw, this.data) : null;
  }

  async getAllCompetitions(): Promise<Competition[]> {
    return this.data.competitions;
  }

  async getAllTeams(): Promise<Team[]> {
    return this.data.teams;
  }

  async getAllVenues(): Promise<Venue[]> {
    return this.data.venues;
  }
}
