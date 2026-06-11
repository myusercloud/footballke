import type {
  Competition,
  Fixture,
  FixtureResponse,
  GetFixturesParams,
  IFixturesService,
  MatchStatus,
  Team,
} from "@/types/fixture";
import type { FixturesProvider } from "@/providers/fixtures/FixturesProvider";
import { JsonFixturesProvider } from "@/providers/fixtures/JsonFixturesProvider";

// ── Sort helpers ──────────────────────────────────────────────────────────────

function byKickoffAsc(a: Fixture, b: Fixture): number {
  return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
}

function byKickoffDesc(a: Fixture, b: Fixture): number {
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

function defaultSort(a: Fixture, b: Fixture): number {
  const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (statusDiff !== 0) return statusDiff;
  if (a.status === "fulltime") return byKickoffDesc(a, b);
  return byKickoffAsc(a, b);
}

// ── Implementation ────────────────────────────────────────────────────────────

class FixturesService implements IFixturesService {
  constructor(private readonly provider: FixturesProvider) {}

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

    let filtered = await this.provider.getAllFixtures();

    if (competitionSlug !== undefined) {
      filtered = filtered.filter((f) => f.competition.slug === competitionSlug);
    }

    if (teamSlug !== undefined) {
      filtered = filtered.filter(
        (f) => f.homeTeam.slug === teamSlug || f.awayTeam.slug === teamSlug
      );
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
      fixtures: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    return this.provider.getFixtureById(id);
  }

  async getUpcomingFixtures(limit = 5): Promise<Fixture[]> {
    const now = new Date();
    const fixtures = await this.provider.getAllFixtures();
    return fixtures
      .filter((f) => f.status === "scheduled" && new Date(f.kickoff) >= now)
      .sort(byKickoffAsc)
      .slice(0, limit);
  }

  async getCompletedFixtures(limit = 10): Promise<Fixture[]> {
    const fixtures = await this.provider.getAllFixtures();
    return fixtures
      .filter((f) => f.status === "fulltime")
      .sort(byKickoffDesc)
      .slice(0, limit);
  }

  async getClubFixtures(teamSlug: string, limit = 10): Promise<Fixture[]> {
    const fixtures = await this.provider.getAllFixtures();
    return fixtures
      .filter((f) => f.homeTeam.slug === teamSlug || f.awayTeam.slug === teamSlug)
      .sort(defaultSort)
      .slice(0, limit);
  }

  async getCompetitions(): Promise<Competition[]> {
    return this.provider.getAllCompetitions();
  }

  async getTeams(): Promise<Team[]> {
    return this.provider.getAllTeams();
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To swap providers, change the argument below.
// When providers/config.ts is in place, use: new FixturesService(getFixturesProvider())

const fixturesService: IFixturesService = new FixturesService(new JsonFixturesProvider());
export default fixturesService;
