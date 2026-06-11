import type { Club, StandingsCompetition } from "@/types/standings";
import rawData from "@/data/standings.json";
import type {
  ProviderStandingsEntry,
  StandingsProvider,
} from "./StandingsProvider";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// The JSON shape for standings is structurally identical to the provider
// contract types (ProviderStandingRow / ProviderStandingsEntry), so no
// additional raw types or mapper functions are required here.
//
// Note: there is deliberately no mapEntry() function for standings. Position
// calculation, zone assignment, and points derivation are service business
// logic (buildTable()) and must not live in the provider.

type RawData = {
  clubs: Club[];
  competitions: StandingsCompetition[];
  standings: ProviderStandingsEntry[];
};

// ── Implementation ────────────────────────────────────────────────────────────

export class JsonStandingsProvider implements StandingsProvider {
  private readonly data: RawData = rawData as RawData;

  async getAllEntries(): Promise<ProviderStandingsEntry[]> {
    return this.data.standings;
  }

  async getAllClubs(): Promise<Club[]> {
    return this.data.clubs;
  }

  async getAllCompetitions(): Promise<StandingsCompetition[]> {
    return this.data.competitions;
  }
}
