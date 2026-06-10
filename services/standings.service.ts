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
  ZoneConfig,
} from "@/types/standings";
import rawData from "@/data/standings.json";

// ── Internal JSON shape ───────────────────────────────────────────────────────
// Mirrors data/standings.json exactly. Private to this module — UI only ever
// sees the computed types from types/standings.ts.

type RawRow = {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string[];
};

type RawStandings = {
  id: string;
  competitionId: string;
  season: Season;
  updatedAt: string;
  zones: ZoneConfig[];
  rows: RawRow[];
};

type RawData = {
  clubs: Club[];
  competitions: StandingsCompetition[];
  standings: RawStandings[];
};

// ── Sort helpers ──────────────────────────────────────────────────────────────

function calcPoints(row: RawRow): number {
  return row.won * 3 + row.drawn;
}

function calcGD(row: RawRow): number {
  return row.goalsFor - row.goalsAgainst;
}

// Canonical league sort: points → GD → GF → club name (alphabetical fallback).
// Used both to assign the true league position and as the tiebreaker when
// sorting by any other field.
function canonicalCompare(
  a: RawRow,
  b: RawRow,
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

class JsonStandingsService implements IStandingsService {
  private readonly data: RawData = rawData as RawData;

  // ── Private helpers ─────────────────────────────────────────────────────────

  private findClub(id: string): Club {
    const club = this.data.clubs.find((c) => c.id === id);
    if (!club) throw new Error(`Club not found in standings data: ${id}`);
    return club;
  }

  /** Find the standings entry that best matches the given params. */
  private findEntry(
    competitionSlug?: string,
    season?: string
  ): RawStandings | null {
    let entries = this.data.standings as RawStandings[];

    if (competitionSlug !== undefined) {
      const comp = this.data.competitions.find(
        (c) => c.slug === competitionSlug
      );
      if (!comp) return null;
      entries = entries.filter((e) => e.competitionId === comp.id);
    }

    if (season !== undefined) {
      entries = entries.filter((e) => e.season.id === season);
    }

    if (entries.length === 0) return null;

    // Default: most recently updated entry (latest season floats to the top).
    return [...entries].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }

  /** All seasons that have data, scoped to a competition if provided. */
  private availableSeasonsFor(competitionId: string): Season[] {
    const seen = new Set<string>();
    const seasons: Season[] = [];

    for (const entry of this.data.standings as RawStandings[]) {
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
    entry: RawStandings,
    sortBy: StandingsSortField = "position"
  ): StandingsTable {
    const competition = this.data.competitions.find(
      (c) => c.id === entry.competitionId
    );
    if (!competition)
      throw new Error(
        `Competition not found in standings data: ${entry.competitionId}`
      );

    const clubs = this.data.clubs;

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

    // Step 3 — attach canonical position + zone to each raw row.
    type Annotated = { raw: RawRow; position: number; zone: TableZone | null };
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
      club: this.findClub(raw.clubId),
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

  // ── IStandingsService ───────────────────────────────────────────────────────

  async getStandings(
    params: GetStandingsParams = {}
  ): Promise<StandingsResponse | null> {
    const { competitionSlug, season, sortBy = "position" } = params;

    const entry = this.findEntry(competitionSlug, season);
    if (!entry) return null;

    const table = this.buildTable(entry, sortBy);

    return {
      table,
      availableSeasons: this.availableSeasonsFor(entry.competitionId),
      availableCompetitions: this.data.competitions,
    };
  }

  async getClubStanding(
    clubSlug: string,
    competitionSlug?: string,
    season?: string
  ): Promise<StandingRow | null> {
    const entry = this.findEntry(competitionSlug, season);
    if (!entry) return null;

    const club = this.data.clubs.find((c) => c.slug === clubSlug);
    if (!club) return null;

    const table = this.buildTable(entry);
    return table.rows.find((r) => r.club.slug === clubSlug) ?? null;
  }

  async getCompetitionStandings(
    competitionSlug: string,
    season?: string
  ): Promise<StandingsTable | null> {
    const entry = this.findEntry(competitionSlug, season);
    if (!entry) return null;
    return this.buildTable(entry);
  }

  async getSeasons(competitionSlug?: string): Promise<Season[]> {
    if (competitionSlug !== undefined) {
      const comp = this.data.competitions.find(
        (c) => c.slug === competitionSlug
      );
      if (!comp) return [];
      return this.availableSeasonsFor(comp.id);
    }

    // No competition scope — return all unique seasons across all competitions.
    const seen = new Set<string>();
    const seasons: Season[] = [];
    for (const entry of this.data.standings as RawStandings[]) {
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
    const entry = this.findEntry(competitionSlug, season);
    return entry?.updatedAt ?? null;
  }

  async getCompetitions(): Promise<StandingsCompetition[]> {
    // Return only competitions that have at least one standings entry.
    const activeIds = new Set(
      (this.data.standings as RawStandings[]).map((e) => e.competitionId)
    );
    return this.data.competitions.filter((c) => activeIds.has(c.id));
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To swap implementations (REST API, sports provider),
// change only this line — nothing else in the codebase changes.

const standingsService: IStandingsService = new JsonStandingsService();
export default standingsService;
