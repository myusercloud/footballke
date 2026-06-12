import type { TournamentProvider } from "./TournamentProvider";

const NOT_IMPL = (name: string) => () =>
  Promise.reject(new Error(`CMSTournamentProvider.${name}: not implemented`));

export class CMSTournamentProvider implements TournamentProvider {
  getTournament      = NOT_IMPL("getTournament");
  getGroups          = NOT_IMPL("getGroups");
  getFixtures        = NOT_IMPL("getFixtures");
  getGroupStandings  = NOT_IMPL("getGroupStandings");
  getTopScorers      = NOT_IMPL("getTopScorers");
  getFeaturedPlayers = NOT_IMPL("getFeaturedPlayers");
  getTeamBySlug      = NOT_IMPL("getTeamBySlug");
  getPlayerBySlug    = NOT_IMPL("getPlayerBySlug");
  getKnockoutRounds  = NOT_IMPL("getKnockoutRounds");
  getLatestNews      = NOT_IMPL("getLatestNews");
}
