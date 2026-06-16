import type {
  GroupStandingsTable,
  KnockoutRound,
  SquadPlayer,
  TopScorer,
  Tournament,
  TournamentGroup,
  TournamentPlayer,
  TournamentTeam,
} from "@/types/tournament";
import type { Fixture } from "@/types/fixture";
import type { TournamentProvider } from "./TournamentProvider";
import { apiFetch } from "@/providers/api-client";

// The tournament slug is the stable identifier used in the Next.js routes.
// For the World Cup 2026 this is always "world-cup".
const TOURNAMENT_SLUG = "world-cup";

type FixtureListResponse = { data: Fixture[]; total: number; page: number; pageSize: number; totalPages: number };

export class APITournamentProvider implements TournamentProvider {
  async getTournament(): Promise<Tournament> {
    return apiFetch<Tournament>(`/tournaments/${TOURNAMENT_SLUG}`);
  }

  async getGroups(): Promise<TournamentGroup[]> {
    return apiFetch<TournamentGroup[]>(`/tournaments/${TOURNAMENT_SLUG}/groups`);
  }

  async getFixtures(): Promise<Fixture[]> {
    const res = await apiFetch<FixtureListResponse>(
      `/tournaments/${TOURNAMENT_SLUG}/fixtures?page=1&pageSize=100`
    );
    return res.data;
  }

  async getGroupStandings(): Promise<GroupStandingsTable[]> {
    return apiFetch<GroupStandingsTable[]>(`/tournaments/${TOURNAMENT_SLUG}/standings`);
  }

  async getTopScorers(): Promise<TopScorer[]> {
    return apiFetch<TopScorer[]>(`/tournaments/${TOURNAMENT_SLUG}/top-scorers`);
  }

  async getFeaturedPlayers(): Promise<TournamentPlayer[]> {
    return apiFetch<TournamentPlayer[]>(`/tournaments/${TOURNAMENT_SLUG}/players/featured`);
  }

  async getTeamBySlug(slug: string): Promise<TournamentTeam | null> {
    try {
      return await apiFetch<TournamentTeam>(
        `/tournaments/${TOURNAMENT_SLUG}/teams/${encodeURIComponent(slug)}`
      );
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }

  async getPlayerBySlug(slug: string): Promise<TournamentPlayer | null> {
    try {
      return await apiFetch<TournamentPlayer>(
        `/tournaments/${TOURNAMENT_SLUG}/players/${encodeURIComponent(slug)}`
      );
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }

  async getKnockoutRounds(): Promise<KnockoutRound[]> {
    // Knockout data is stored in the tournament object's groups/fixtures
    // and returned as bracket rounds. Return empty until implemented.
    return [];
  }

  async getSquad(teamSlug: string): Promise<SquadPlayer[]> {
    return apiFetch<SquadPlayer[]>(
      `/tournaments/${TOURNAMENT_SLUG}/teams/${encodeURIComponent(teamSlug)}/squad`
    );
  }
}
