import type {
  Tournament,
  TournamentGroup,
  TournamentTeam,
  TournamentPlayer,
  TopScorer,
  GroupStandingsTable,
  KnockoutRound,
  SquadPlayer,
  ITournamentService,
  GetTournamentFixturesParams,
  TournamentFixtureResponse,
  GroupLetter,
} from "@/types/tournament";
import type { Article } from "@/types/news";
import type { Fixture, MatchStatus } from "@/types/fixture";
import type { TournamentProvider } from "@/providers/tournaments/TournamentProvider";
import { getTournamentProvider } from "@/providers/config";
import newsService from "@/services/news.service";

// ── Sort helpers ──────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<MatchStatus, number> = {
  live: 0, halftime: 1, scheduled: 2, fulltime: 3, postponed: 4,
};

function sortFixtures(a: Fixture, b: Fixture): number {
  const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (diff !== 0) return diff;
  const ta = new Date(a.kickoff).getTime();
  const tb = new Date(b.kickoff).getTime();
  return a.status === "fulltime" ? tb - ta : ta - tb;
}

// ── Implementation ────────────────────────────────────────────────────────────

class TournamentService implements ITournamentService {
  constructor(private readonly provider: TournamentProvider) {}

  async getTournament(): Promise<Tournament> {
    return this.provider.getTournament();
  }

  async getGroups(): Promise<TournamentGroup[]> {
    return this.provider.getGroups();
  }

  async getGroupStandings(groupLetter?: GroupLetter): Promise<GroupStandingsTable[]> {
    const all = await this.provider.getGroupStandings();
    if (groupLetter) return all.filter((t) => t.group.letter === groupLetter);
    return all;
  }

  async getKnockoutRounds(): Promise<KnockoutRound[]> {
    return this.provider.getKnockoutRounds();
  }

  async getFixtures(params: GetTournamentFixturesParams = {}): Promise<TournamentFixtureResponse> {
    const { groupLetter, stage, teamSlug, status, page = 1, pageSize = 20 } = params;

    let results = await this.provider.getFixtures();

    if (groupLetter) {
      results = results.filter((f) => f.groupLetter === groupLetter);
    }

    if (stage) {
      results = results.filter((f) => f.stage === stage);
    }

    if (teamSlug) {
      results = results.filter(
        (f) => f.homeTeam.slug === teamSlug || f.awayTeam.slug === teamSlug
      );
    }

    if (status !== undefined) {
      const statuses = Array.isArray(status) ? status : [status];
      results = results.filter((f) => statuses.includes(f.status));
    }

    const sorted = [...results].sort(sortFixtures);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    return {
      fixtures: sorted.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getTopScorers(limit = 10): Promise<TopScorer[]> {
    const all = await this.provider.getTopScorers();
    return all.slice(0, limit);
  }

  async getFeaturedPlayers(limit = 8): Promise<TournamentPlayer[]> {
    const all = await this.provider.getFeaturedPlayers();
    return all.slice(0, limit);
  }

  async getTeamBySlug(slug: string): Promise<TournamentTeam | null> {
    return this.provider.getTeamBySlug(slug);
  }

  async getPlayerBySlug(slug: string): Promise<TournamentPlayer | null> {
    return this.provider.getPlayerBySlug(slug);
  }

  async getSquad(teamSlug: string): Promise<SquadPlayer[]> {
    return this.provider.getSquad(teamSlug);
  }

  async getLatestNews(limit = 5): Promise<Article[]> {
    const { articles } = await newsService.getNews({
      categorySlug: "world-cup",
      pageSize: limit,
    });
    return articles;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

const tournamentService: ITournamentService = new TournamentService(getTournamentProvider());
export default tournamentService;
