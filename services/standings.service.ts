import type {
  Club,
  GetStandingsParams,
  IStandingsService,
  Season,
  StandingRow,
  StandingsCompetition,
  StandingsResponse,
  StandingsTable,
  StandingsSortField,
  TableZone,
} from "@/types/standings";
import type {
  ProviderStandingRow,
  ProviderStandingsEntry,
  StandingsProvider,
} from "@/providers/standings/StandingsProvider";
import { getStandingsProvider } from "@/providers/config";
import { computeRowsFromFixtures, extractClubsFromFixtures } from "@/lib/standings-from-fixtures";
import fixturesService from "@/services/fixtures.service";

// ── Sort helpers ──────────────────────────────────────────────────────────────

function calcPoints(row: ProviderStandingRow): number {
  return row.won * 3 + row.drawn;
}

function calcGD(row: ProviderStandingRow): number {
  return row.goalsFor - row.goalsAgainst;
}

// Canonical league sort: points → GD → GF → club name (alphabetical fallback).
// Used both to assign the true league position and as the tiebreaker when
// sorting by any other field.
function canonicalCompare(
  a: ProviderStandingRow,
  b: ProviderStandingRow,
  clubs: Club[]
): number {
  const ptsDiff = calcPoints(b) - calcPoints(a);
  if (ptsDiff !== 0) return ptsDiff;

  const gdDiff = calcGD(b) - calcGD(a);
  if (gdDiff !== 0) return gdDiff;

  const gfDiff = b.goalsFor - a.goalsFor;
  if (gfDiff !== 0) return gfDiff;

  const nameA = clubs.find((c) => c.id === a.clubId)?.name ?? a.clubId;
  const nameB = clubs.find((c) => c.id === b.clubId)?.name ?? b.clubId;
  return nameA.localeCompare(nameB);
}

// ── Implementation ────────────────────────────────────────────────────────────

class StandingsService implements IStandingsService {
  constructor(private readonly provider: StandingsProvider) {}

  // ── Private helpers ─────────────────────────────────────────────────────────

  private findClub(id: string, clubs: Club[]): Club {
    const club = clubs.find((c) => c.id === id);
    if (!club) throw new Error(`Club not found in standings data: ${id}`);
    return club;
  }

  /** Find the standings entry that best matches the given params. */
  private findEntry(
    entries: ProviderStandingsEntry[],
    competitions: StandingsCompetition[],
    competitionSlug?: string,
    season?: string
  ): ProviderStandingsEntry | null {
    let filtered = entries;

    if (competitionSlug !== undefined) {
      const comp = competitions.find((c) => c.slug === competitionSlug);
      if (!comp) return null;
      filtered = filtered.filter((e) => e.competitionId === comp.id);
    }

    if (season !== undefined) {
      filtered = filtered.filter((e) => e.season.id === season);
    }

    if (filtered.length === 0) return null;

    // Default: most recently updated entry (latest season floats to the top).
    return [...filtered].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }

  /** All seasons that have data, scoped to a competition. */
  private availableSeasonsFor(
    entries: ProviderStandingsEntry[],
    competitionId: string
  ): Season[] {
    const seen = new Set<string>();
    const seasons: Season[] = [];

    for (const entry of entries) {
      if (
        entry.competitionId === competitionId &&
        !seen.has(entry.season.id)
      ) {
        seen.add(entry.season.id);
        seasons.push(entry.season);
      }
    }

    // Latest season first.
    return seasons.sort((a, b) => b.id.localeCompare(a.id));
  }

  /**
   * Core builder:
   * 1. Sort rows canonically → assign true league positions + zones.
   * 2. Optionally re-sort by sortBy for display.
   * 3. Map each row to the fully-computed StandingRow shape.
   *
   * The `position` field always carries the canonical league position,
   * regardless of the display sort order.
   */
  private buildTable(
    entry: ProviderStandingsEntry,
    clubs: Club[],
    competitions: StandingsCompetition[],
    sortBy: StandingsSortField = "position"
  ): StandingsTable {
    const competition = competitions.find((c) => c.id === entry.competitionId);
    if (!competition)
      throw new Error(
        `Competition not found in standings data: ${entry.competitionId}`
      );

    // Step 1 — canonical sort to determine true positions.
    const canonical = [...entry.rows].sort((a, b) =>
      canonicalCompare(a, b, clubs)
    );

    // Step 2 — build a position → zone map from the zone config.
    const zoneMap = new Map<number, TableZone>();
    for (const z of entry.zones) {
      for (let pos = z.from; pos <= z.to; pos++) {
        zoneMap.set(pos, z.type);
      }
    }

    // Step 3 — attach canonical position + zone to each row.
    type Annotated = { raw: ProviderStandingRow; position: number; zone: TableZone | null };
    const annotated: Annotated[] = canonical.map((raw, i) => ({
      raw,
      position: i + 1,
      zone: zoneMap.get(i + 1) ?? null,
    }));

    // Step 4 — apply display sort if requested (position numbers stay fixed).
    if (sortBy !== "position") {
      annotated.sort((a, b) => {
        const ra = a.raw;
        const rb = b.raw;

        if (sortBy === "points") {
          const diff = calcPoints(rb) - calcPoints(ra);
          return diff !== 0 ? diff : canonicalCompare(ra, rb, clubs);
        }
        if (sortBy === "goalDifference") {
          const diff = calcGD(rb) - calcGD(ra);
          return diff !== 0 ? diff : canonicalCompare(ra, rb, clubs);
        }
        if (sortBy === "goalsFor") {
          const diff = rb.goalsFor - ra.goalsFor;
          return diff !== 0 ? diff : canonicalCompare(ra, rb, clubs);
        }
        return 0;
      });
    }

    // Step 5 — map to fully-computed StandingRow.
    const rows: StandingRow[] = annotated.map(({ raw, position, zone }) => ({
      position,
      club: this.findClub(raw.clubId, clubs),
      played: raw.played,
      won: raw.won,
      drawn: raw.drawn,
      lost: raw.lost,
      goalsFor: raw.goalsFor,
      goalsAgainst: raw.goalsAgainst,
      goalDifference: calcGD(raw),
      points: calcPoints(raw),
      form: raw.form,
      zone,
    }));

    return {
      id: entry.id,
      competition,
      season: entry.season,
      zones: entry.zones,
      rows,
      updatedAt: entry.updatedAt,
    };
  }

  /**
   * Fetches all fulltime fixtures for a competition and, if any exist,
   * overlays the stored standing rows with values computed from those fixtures.
   * Falls back to stored rows when no finished fixtures are available yet.
   */
  private async resolveRows(
    entry: ProviderStandingsEntry,
    storedClubs: Club[],
    competitions: StandingsCompetition[]
  ): Promise<{ entry: ProviderStandingsEntry; clubs: Club[] }> {
    const comp = competitions.find((c) => c.id === entry.competitionId);
    if (!comp) return { entry, clubs: storedClubs };

    try {
      const { fixtures: finished } = await fixturesService.getFixtures({
        competitionSlug: comp.slug,
        status: 'fulltime',
        pageSize: 1000,
      });

      if (finished.length > 0) {
        const computedRows = computeRowsFromFixtures(finished);
        const clubsFromFixtures = extractClubsFromFixtures(finished);
        return { entry: { ...entry, rows: computedRows }, clubs: clubsFromFixtures };
      }
    } catch {
      // fixtures service unavailable — fall through to stored rows
    }

    return { entry, clubs: storedClubs };
  }

  // ── IStandingsService ───────────────────────────────────────────────────────

  async getStandings(
    params: GetStandingsParams = {}
  ): Promise<StandingsResponse | null> {
    const { competitionSlug, season, sortBy = "position" } = params;

    const [entries, storedClubs, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllClubs(),
      this.provider.getAllCompetitions(),
    ]);

    const entry = this.findEntry(entries, competitions, competitionSlug, season);
    if (!entry) return null;

    const { entry: resolvedEntry, clubs } = await this.resolveRows(entry, storedClubs, competitions);
    const table = this.buildTable(resolvedEntry, clubs, competitions, sortBy);

    return {
      table,
      availableSeasons: this.availableSeasonsFor(entries, entry.competitionId),
      availableCompetitions: competitions,
    };
  }

  async getClubStanding(
    clubSlug: string,
    competitionSlug?: string,
    season?: string
  ): Promise<StandingRow | null> {
    const [entries, storedClubs, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllClubs(),
      this.provider.getAllCompetitions(),
    ]);

    const entry = this.findEntry(entries, competitions, competitionSlug, season);
    if (!entry) return null;

    const { entry: resolvedEntry, clubs } = await this.resolveRows(entry, storedClubs, competitions);
    const table = this.buildTable(resolvedEntry, clubs, competitions);
    return table.rows.find((r) => r.club.slug === clubSlug) ?? null;
  }

  async getCompetitionStandings(
    competitionSlug: string,
    season?: string
  ): Promise<StandingsTable | null> {
    const [entries, storedClubs, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllClubs(),
      this.provider.getAllCompetitions(),
    ]);

    const entry = this.findEntry(entries, competitions, competitionSlug, season);
    if (!entry) return null;

    const { entry: resolvedEntry, clubs } = await this.resolveRows(entry, storedClubs, competitions);
    return this.buildTable(resolvedEntry, clubs, competitions);
  }

  async getSeasons(competitionSlug?: string): Promise<Season[]> {
    const [entries, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllCompetitions(),
    ]);

    if (competitionSlug !== undefined) {
      const comp = competitions.find((c) => c.slug === competitionSlug);
      if (!comp) return [];
      return this.availableSeasonsFor(entries, comp.id);
    }

    // No competition scope — return all unique seasons across all competitions.
    const seen = new Set<string>();
    const seasons: Season[] = [];
    for (const entry of entries) {
      if (!seen.has(entry.season.id)) {
        seen.add(entry.season.id);
        seasons.push(entry.season);
      }
    }
    return seasons.sort((a, b) => b.id.localeCompare(a.id));
  }

  async getLastUpdated(
    competitionSlug?: string,
    season?: string
  ): Promise<string | null> {
    const [entries, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllCompetitions(),
    ]);
    const entry = this.findEntry(entries, competitions, competitionSlug, season);
    return entry?.updatedAt ?? null;
  }

  async getCompetitions(): Promise<StandingsCompetition[]> {
    const [entries, competitions] = await Promise.all([
      this.provider.getAllEntries(),
      this.provider.getAllCompetitions(),
    ]);
    // Return only competitions that have at least one standings entry.
    const activeIds = new Set(entries.map((e) => e.competitionId));
    return competitions.filter((c) => activeIds.has(c.id));
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To switch backends, set CONTENT_SOURCE in .env.local.
// Provider selection lives in providers/config.ts.

const standingsService: IStandingsService = new StandingsService(getStandingsProvider());
export default standingsService;
