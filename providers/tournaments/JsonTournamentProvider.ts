import type { TournamentProvider } from "./TournamentProvider";
import type {
  Tournament,
  TournamentGroup,
  TournamentTeam,
  TournamentPlayer,
  TournamentStanding,
  TopScorer,
  GroupStandingsTable,
  KnockoutRound,
  KnockoutMatch,
  TournamentStage,
  GroupLetter,
  SquadPlayer,
} from "@/types/tournament";
import type { Fixture, MatchStatus, Score } from "@/types/fixture";

import tournamentRaw   from "@/data/world-cup/tournament.json";
import groupsRaw       from "@/data/world-cup/groups.json";
import fixturesRaw     from "@/data/world-cup/fixtures.json";
import standingsRaw    from "@/data/world-cup/standings.json";
import topScorersRaw   from "@/data/world-cup/top-scorers.json";
import featuredRaw     from "@/data/world-cup/featured-players.json";
import squadsRaw       from "@/data/world-cup/squads.json";

// ── Team index ────────────────────────────────────────────────────────────────
// Built once at construction; used to resolve teamSlug references in fixtures
// and standings without repeated array searches.

function buildTeamIndex(groups: TournamentGroup[]): Map<string, TournamentTeam> {
  const index = new Map<string, TournamentTeam>();
  for (const g of groups) {
    for (const t of g.teams) {
      index.set(t.slug, t);
    }
  }
  return index;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapGroup(raw: (typeof groupsRaw.groups)[number]): TournamentGroup {
  return {
    letter: raw.letter as GroupLetter,
    teams: raw.teams.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      shortName: t.shortName,
      abbreviation: t.abbreviation,
      flag: t.flag,
      colors: { primary: t.colors.primary, secondary: t.colors.secondary },
      confederation: t.confederation as TournamentTeam["confederation"],
      fifaRanking: t.fifaRanking,
      groupLetter: t.groupLetter as GroupLetter | undefined,
    })),
  };
}

function computeAge(dateOfBirth: string): number {
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function mapPlayer(
  raw: (typeof featuredRaw.featuredPlayers)[number],
  teamIndex: Map<string, TournamentTeam>
): TournamentPlayer {
  const team = teamIndex.get(raw.teamSlug);
  if (!team) throw new Error(`JsonTournamentProvider: unknown teamSlug "${raw.teamSlug}" in featured-players.json`);
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    jerseyNumber: raw.jerseyNumber,
    position: raw.position as TournamentPlayer["position"],
    secondaryPosition: raw.secondaryPosition as TournamentPlayer["secondaryPosition"],
    nationality: raw.nationality,
    dateOfBirth: raw.dateOfBirth,
    age: computeAge(raw.dateOfBirth),
    height: raw.height,
    preferredFoot: raw.preferredFoot as TournamentPlayer["preferredFoot"],
    team,
    image: raw.image,
    stats: raw.stats,
    bio: raw.bio,
    searchableName: raw.searchableName,
    searchableKeywords: raw.searchableKeywords,
    searchableSlug: raw.searchableSlug,
  };
}

// Maps a raw fixture entry to the canonical Fixture shape used across the site.
// homeTeamSlug / awayTeamSlug of null produce a placeholder TBD team for
// knockout entries where qualification is not yet determined.
function mapFixture(
  raw: (typeof fixturesRaw.fixtures)[number],
  teamIndex: Map<string, TournamentTeam>
): Fixture {
  const TBD_TEAM = (label: string) => ({
    id: `tbd-${label}`,
    name: "TBD",
    shortName: "TBD",
    abbreviation: "TBD",
    slug: `tbd-${label}`,
    logo: "",
    colors: { primary: "#9ca3af", secondary: "#ffffff" },
  });

  const toTeam = (slug: string | null, side: "home" | "away") => {
    if (!slug) return TBD_TEAM(side);
    const t = teamIndex.get(slug);
    if (!t) throw new Error(`JsonTournamentProvider: unknown teamSlug "${slug}" in fixtures.json`);
    return { id: t.id, name: t.name, shortName: t.shortName, abbreviation: t.abbreviation, slug: t.slug, logo: t.flag, colors: t.colors };
  };

  const competition = {
    id: "world-cup-2026",
    name: "2026 FIFA World Cup",
    slug: "world-cup-2026",
    logo: "/tournaments/world-cup-2026.svg",
    country: "USA / Canada / Mexico",
    season: "2026",
  };

  return {
    id: raw.id,
    homeTeam: toTeam(raw.homeTeamSlug, "home"),
    awayTeam: toTeam(raw.awayTeamSlug, "away"),
    competition,
    venue: { id: raw.venue.id, name: raw.venue.name, city: raw.venue.city },
    kickoff: raw.kickoff,
    status: raw.status as MatchStatus,
    matchday: raw.matchday ?? undefined,
    groupLetter: (raw as Record<string, unknown>).groupLetter as string | undefined,
    stage: (raw as Record<string, unknown>).stage as string | undefined,
    label: (raw as Record<string, unknown>).label as string | undefined,
    score: raw.score as Score | undefined ?? undefined,
    homeForm: [],
    awayForm: [],
    relatedNewsSlugs: [],
    featured: raw.featured,
    goalEvents: [],
  };
}

function mapStandings(
  raw: (typeof standingsRaw.standings)[number],
  groups: TournamentGroup[]
): GroupStandingsTable {
  const group = groups.find((g) => g.letter === raw.groupLetter);
  if (!group) throw new Error(`JsonTournamentProvider: no group "${raw.groupLetter}"`);

  const teamBySlug = new Map(group.teams.map((t) => [t.slug, t]));

  const rows: TournamentStanding[] = raw.rows.map((row) => {
    const team = teamBySlug.get(row.teamSlug);
    if (!team) throw new Error(`JsonTournamentProvider: unknown teamSlug "${row.teamSlug}" in standings.json`);
    return {
      position: row.position,
      team,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
      form: row.form,
      status: row.status as TournamentStanding["status"],
    };
  });

  return { group, rows };
}

type RawScorer = { rank: number; playerSlug: string; playerName: string; teamSlug: string; goals: number; assists: number; appearances: number };
function mapTopScorer(
  raw: RawScorer,
  teamIndex: Map<string, TournamentTeam>
): TopScorer {
  const team = teamIndex.get(raw.teamSlug);
  if (!team) throw new Error(`JsonTournamentProvider: unknown teamSlug "${raw.teamSlug}" in top-scorers.json`);
  return {
    rank: raw.rank,
    playerSlug: raw.playerSlug,
    playerName: raw.playerName,
    team,
    goals: raw.goals,
    assists: raw.assists,
    appearances: raw.appearances,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class JsonTournamentProvider implements TournamentProvider {
  private readonly tournament: Tournament;
  private readonly groups: TournamentGroup[];
  private readonly fixtures: Fixture[];
  private readonly groupStandings: GroupStandingsTable[];
  private readonly topScorers: TopScorer[];
  private readonly featuredPlayers: TournamentPlayer[];
  private readonly teamIndex: Map<string, TournamentTeam>;
  private readonly squadIndex: Map<string, SquadPlayer[]>;

  constructor() {
    const groups = groupsRaw.groups.map(mapGroup);
    const teamIndex = buildTeamIndex(groups);

    this.groups = groups;
    this.teamIndex = teamIndex;
    this.fixtures = fixturesRaw.fixtures.map((f) => mapFixture(f as typeof fixturesRaw.fixtures[number], teamIndex));
    this.groupStandings = standingsRaw.standings.map((s) => mapStandings(s, groups));
    this.topScorers = (topScorersRaw.topScorers as RawScorer[]).map((s) => mapTopScorer(s, teamIndex));
    this.featuredPlayers = featuredRaw.featuredPlayers.map((p) => mapPlayer(p as typeof featuredRaw.featuredPlayers[number], teamIndex));

    this.squadIndex = new Map(
      Object.entries(squadsRaw.squads).map(([slug, data]) => [
        slug,
        (data.players as SquadPlayer[]),
      ])
    );

    const t = tournamentRaw.tournament;
    this.tournament = {
      id: t.id,
      slug: t.slug,
      name: t.name,
      shortName: t.shortName,
      edition: t.edition,
      host: {
        countries: t.host.countries,
        cities: t.host.cities,
        venues: t.host.venues,
      },
      dates: {
        start: t.dates.start,
        end: t.dates.end,
        groupStageEnd: t.dates.groupStageEnd,
        knockoutStart: t.dates.knockoutStart,
      },
      currentPhase: t.currentPhase as TournamentStage,
      emblem: t.emblem,
      groups,
      totalTeams: t.totalTeams,
      featured: t.featured,
    };
  }

  async getTournament(): Promise<Tournament> { return this.tournament; }
  async getGroups(): Promise<TournamentGroup[]> { return this.groups; }
  async getFixtures(): Promise<Fixture[]> { return this.fixtures; }
  async getGroupStandings(): Promise<GroupStandingsTable[]> { return this.groupStandings; }
  async getTopScorers(): Promise<TopScorer[]> { return this.topScorers; }
  async getFeaturedPlayers(): Promise<TournamentPlayer[]> { return this.featuredPlayers; }
  async getTeamBySlug(slug: string): Promise<TournamentTeam | null> { return this.teamIndex.get(slug) ?? null; }
  async getPlayerBySlug(slug: string): Promise<TournamentPlayer | null> {
    return this.featuredPlayers.find((p) => p.slug === slug) ?? null;
  }
  async getSquad(teamSlug: string): Promise<SquadPlayer[]> {
    return this.squadIndex.get(teamSlug) ?? [];
  }
  async getKnockoutRounds(): Promise<KnockoutRound[]> {
    const knockoutFixtures = this.fixtures.filter((f) => f.matchday === undefined || f.matchday === null);
    const stageOrder: TournamentStage[] = ["round-of-16", "quarter-final", "semi-final", "final"];
    const byStage = new Map<TournamentStage, KnockoutMatch[]>();
    for (const f of knockoutFixtures) {
      const stage = (f.stage ?? "round-of-16") as TournamentStage;
      const match: KnockoutMatch = {
        id: f.id,
        stage,
        team1: f.homeTeam.slug.startsWith("tbd-") ? null : (this.teamIndex.get(f.homeTeam.slug) ?? null),
        team2: f.awayTeam.slug.startsWith("tbd-") ? null : (this.teamIndex.get(f.awayTeam.slug) ?? null),
        score: f.score,
        kickoff: f.kickoff,
        venue: f.venue.name,
        status: f.status,
        label: f.label,
      };
      if (!byStage.has(stage)) byStage.set(stage, []);
      byStage.get(stage)!.push(match);
    }
    return stageOrder
      .filter((s) => byStage.has(s))
      .map((stage) => ({ stage, matches: byStage.get(stage)! }));
  }
}
