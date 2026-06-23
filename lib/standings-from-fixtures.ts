import type { Fixture } from "@/types/fixture";
import type { Club } from "@/types/standings";
import type { ProviderStandingRow } from "@/providers/standings/StandingsProvider";

type Accumulator = {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  results: string[];
};

/**
 * Derive standing rows by aggregating all fulltime fixtures.
 * Fixtures must already be filtered to the desired competition + season.
 * Sorted chronologically so the form array (last 5) is correct.
 */
export function computeRowsFromFixtures(fixtures: Fixture[]): ProviderStandingRow[] {
  const sorted = [...fixtures]
    .filter((f) => f.status === 'fulltime' && f.score != null)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  const map = new Map<string, Accumulator>();

  function getOrCreate(clubId: string): Accumulator {
    if (!map.has(clubId)) {
      map.set(clubId, { clubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, results: [] });
    }
    return map.get(clubId)!;
  }

  for (const f of sorted) {
    const hg = f.score!.home;
    const ag = f.score!.away;
    const homeId = f.homeTeam.id;
    const awayId = f.awayTeam.id;

    const home = getOrCreate(homeId);
    const away = getOrCreate(awayId);

    home.played++;
    away.played++;
    home.goalsFor += hg;
    home.goalsAgainst += ag;
    away.goalsFor += ag;
    away.goalsAgainst += hg;

    if (hg > ag) {
      home.won++;    home.results.push('W');
      away.lost++;   away.results.push('L');
    } else if (hg < ag) {
      home.lost++;   home.results.push('L');
      away.won++;    away.results.push('W');
    } else {
      home.drawn++;  home.results.push('D');
      away.drawn++;  away.results.push('D');
    }
  }

  return Array.from(map.values()).map((acc): ProviderStandingRow => ({
    clubId: acc.clubId,
    played: acc.played,
    won: acc.won,
    drawn: acc.drawn,
    lost: acc.lost,
    goalsFor: acc.goalsFor,
    goalsAgainst: acc.goalsAgainst,
    form: acc.results.slice(-5),
  }));
}

/**
 * Extract unique Club objects from fixture team data.
 * Used alongside computeRowsFromFixtures so StandingsService.buildTable()
 * can resolve clubId references without a separate provider call.
 */
export function extractClubsFromFixtures(fixtures: Fixture[]): Club[] {
  const seen = new Map<string, Club>();
  for (const f of fixtures) {
    for (const team of [f.homeTeam, f.awayTeam]) {
      if (!seen.has(team.id)) {
        seen.set(team.id, {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          slug: team.slug,
          logo: team.logo,
          colors: team.colors,
        });
      }
    }
  }
  return Array.from(seen.values());
}
