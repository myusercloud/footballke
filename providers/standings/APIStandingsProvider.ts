import type { Club, StandingsCompetition } from "@/types/standings";
import type { ProviderStandingsEntry, StandingsProvider } from "./StandingsProvider";
import { apiFetch } from "@/providers/api-client";

export class APIStandingsProvider implements StandingsProvider {
  async getAllEntries(): Promise<ProviderStandingsEntry[]> {
    return apiFetch<ProviderStandingsEntry[]>('/standings');
  }

  async getAllClubs(): Promise<Club[]> {
    return apiFetch<Club[]>('/standings/clubs');
  }

  async getAllCompetitions(): Promise<StandingsCompetition[]> {
    return apiFetch<StandingsCompetition[]>('/standings/competitions');
  }
}
