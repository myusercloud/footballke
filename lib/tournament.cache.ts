import { cache } from "react";
import tournamentService from "@/services/tournament.service";
import type { GetTournamentFixturesParams, GroupLetter } from "@/types/tournament";

export const getTournament = cache(() =>
  tournamentService.getTournament()
);

export const getGroups = cache(() =>
  tournamentService.getGroups()
);

export const getGroupStandings = cache((groupLetter?: GroupLetter) =>
  tournamentService.getGroupStandings(groupLetter)
);

export const getKnockoutRounds = cache(() =>
  tournamentService.getKnockoutRounds()
);

export const getTournamentFixtures = cache((params: GetTournamentFixturesParams = {}) =>
  tournamentService.getFixtures(params)
);

export const getTopScorers = cache((limit?: number) =>
  tournamentService.getTopScorers(limit)
);

export const getFeaturedPlayers = cache((limit?: number) =>
  tournamentService.getFeaturedPlayers(limit)
);

export const getTeam = cache((slug: string) =>
  tournamentService.getTeamBySlug(slug)
);

export const getTournamentPlayer = cache((slug: string) =>
  tournamentService.getPlayerBySlug(slug)
);

export const getTournamentNews = cache((limit?: number) =>
  tournamentService.getLatestNews(limit)
);
