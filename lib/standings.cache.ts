import { cache } from "react";
import standingsService from "@/services/standings.service";
import type { GetStandingsParams } from "@/types/standings";

export const getStandings = cache(
  (params: GetStandingsParams = {}) => standingsService.getStandings(params)
);

export const getCompetitionStandings = cache(
  (competitionSlug: string, season?: string) =>
    standingsService.getCompetitionStandings(competitionSlug, season)
);

export const getClubStanding = cache(
  (clubSlug: string, competitionSlug?: string, season?: string) =>
    standingsService.getClubStanding(clubSlug, competitionSlug, season)
);

export const getSeasons = cache(
  (competitionSlug?: string) => standingsService.getSeasons(competitionSlug)
);

export const getStandingsCompetitions = cache(
  () => standingsService.getCompetitions()
);

export const getLastUpdated = cache(
  (competitionSlug?: string, season?: string) =>
    standingsService.getLastUpdated(competitionSlug, season)
);
