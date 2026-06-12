import type {
  Tournament,
  TournamentGroup,
  TournamentTeam,
  TournamentPlayer,
  TopScorer,
  GroupStandingsTable,
  KnockoutRound,
} from "@/types/tournament";
import type { Fixture } from "@/types/fixture";

export interface TournamentProvider {
  getTournament(): Promise<Tournament>;
  getGroups(): Promise<TournamentGroup[]>;
  getFixtures(): Promise<Fixture[]>;
  getGroupStandings(): Promise<GroupStandingsTable[]>;
  getTopScorers(): Promise<TopScorer[]>;
  getFeaturedPlayers(): Promise<TournamentPlayer[]>;
  getTeamBySlug(slug: string): Promise<TournamentTeam | null>;
  getPlayerBySlug(slug: string): Promise<TournamentPlayer | null>;
  getKnockoutRounds(): Promise<KnockoutRound[]>;
}
