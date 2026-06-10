import type {
  Competition,
  Fixture,
  FixtureResponse,
  GetFixturesParams,
  IFixturesService,
  MatchStats,
  MatchStatus,
  Score,
  Team,
  Venue,
} from "@/types/fixture";
import rawData from "@/data/fixtures.json";

// ── Internal JSON shape ───────────────────────────────────────────────────────
// Matches data/fixtures.json exactly. Kept private — UI only ever sees the
// joined Fixture type from types/fixture.ts.

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

// ── Sort helpers ──────────────────────────────────────────────────────────────

function byKickoffAsc(a: RawFixture, b: RawFixture): number {
  return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
}

function byKickoffDesc(a: RawFixture, b: RawFixture): number {
  return new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime();
}

// Default sort priority for the listing page:
//   live → halftime → scheduled → fulltime → postponed
// Within each group: upcoming sorted nearest-first; completed sorted newest-first.
const STATUS_ORDER: Record<MatchStatus, number> = {
  live: 0,
  halftime: 1,
  scheduled: 2,
  fulltime: 3,
  postponed: 4,
};

function defaultSort(a: RawFixture, b: RawFixture): number {
  const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (statusDiff !== 0) return statusDiff;
  if (a.status === "fulltime") return byKickoffDesc(a, b);
  return byKickoffAsc(a, b);
}

// ── Implementation ────────────────────────────────────────────────────────────

class JsonFixturesService implements IFixturesService {
  private readonly data: RawData = rawData as RawData;

  async getFixtures(params: GetFixturesParams = {}): Promise<FixtureResponse> {
    const {
      page = 1,
      pageSize = 10,
      competitionSlug,
      teamSlug,
      status,
      dateFrom,
      dateTo,
    } = params;

    let filtered = this.data.fixtures as RawFixture[];

    if (competitionSlug !== undefined) {
      const comp = this.data.competitions.find((c) => c.slug === competitionSlug);
      filtered = comp
        ? filtered.filter((f) => f.competitionId === comp.id)
        : [];
    }

    if (teamSlug !== undefined) {
      const team = this.data.teams.find((t) => t.slug === teamSlug);
      filtered = team
        ? filtered.filter(
            (f) => f.homeTeamId === team.id || f.awayTeamId === team.id
          )
        : [];
    }

    if (status !== undefined) {
      const statuses = Array.isArray(status) ? status : [status];
      filtered = filtered.filter((f) => statuses.includes(f.status));
    }

    if (dateFrom !== undefined) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((f) => new Date(f.kickoff) >= from);
    }

    if (dateTo !== undefined) {
      // Include all kickoffs within the dateTo day (end of day)
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((f) => new Date(f.kickoff) <= to);
    }

    const sorted = [...filtered].sort(defaultSort);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    return {
      fixtures: paginated.map((f) => mapFixture(f, this.data)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    const raw = (this.data.fixtures as RawFixture[]).find((f) => f.id === id);
    return raw ? mapFixture(raw, this.data) : null;
  }

  async getUpcomingFixtures(limit = 5): Promise<Fixture[]> {
    const now = new Date();
    return (this.data.fixtures as RawFixture[])
      .filter((f) => f.status === "scheduled" && new Date(f.kickoff) >= now)
      .sort(byKickoffAsc)
      .slice(0, limit)
      .map((f) => mapFixture(f, this.data));
  }

  async getCompletedFixtures(limit = 10): Promise<Fixture[]> {
    return (this.data.fixtures as RawFixture[])
      .filter((f) => f.status === "fulltime")
      .sort(byKickoffDesc)
      .slice(0, limit)
      .map((f) => mapFixture(f, this.data));
  }

  async getClubFixtures(teamSlug: string, limit = 10): Promise<Fixture[]> {
    const team = this.data.teams.find((t) => t.slug === teamSlug);
    if (!team) return [];

    return (this.data.fixtures as RawFixture[])
      .filter((f) => f.homeTeamId === team.id || f.awayTeamId === team.id)
      .sort(defaultSort)
      .slice(0, limit)
      .map((f) => mapFixture(f, this.data));
  }

  async getCompetitions(): Promise<Competition[]> {
    return this.data.competitions;
  }

  async getTeams(): Promise<Team[]> {
    return this.data.teams;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To swap implementations (REST API, sports provider),
// change only the line below — nothing else in the codebase changes.

const fixturesService: IFixturesService = new JsonFixturesService();
export default fixturesService;
