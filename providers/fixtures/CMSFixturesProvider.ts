import type { Fixture, Team, Competition, Venue, MatchStatus } from "@/types/fixture"
import type { FixturesProvider } from "./FixturesProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SFixture = {
  id: number; documentId: string
  status: string
  kickoff: string
  matchday: number | null
  featured: boolean
  homeTeamId: string; homeTeamName: string; homeTeamShortName: string
  homeTeamAbbreviation: string; homeTeamSlug: string
  homeTeamLogo: string; homeTeamPrimaryColor: string
  awayTeamId: string; awayTeamName: string; awayTeamShortName: string
  awayTeamAbbreviation: string; awayTeamSlug: string
  awayTeamLogo: string; awayTeamPrimaryColor: string
  competitionId: string; competitionName: string
  competitionSlug: string; competitionSeason: string
  venueName: string | null; venueCity: string | null
  scoreHome: number | null; scoreAway: number | null
  liveMinute: number | null
  preview: string | null
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapFixture(raw: SFixture): Fixture {
  const hasScore = raw.scoreHome !== null && raw.scoreAway !== null

  return {
    id: raw.documentId,
    status: raw.status as MatchStatus,
    kickoff: raw.kickoff,
    ...(raw.matchday != null ? { matchday: raw.matchday } : {}),
    featured: raw.featured,
    homeTeam: {
      id: raw.homeTeamId,
      name: raw.homeTeamName,
      shortName: raw.homeTeamShortName,
      abbreviation: raw.homeTeamAbbreviation,
      slug: raw.homeTeamSlug,
      logo: raw.homeTeamLogo,
      colors: { primary: raw.homeTeamPrimaryColor, secondary: '' },
    },
    awayTeam: {
      id: raw.awayTeamId,
      name: raw.awayTeamName,
      shortName: raw.awayTeamShortName,
      abbreviation: raw.awayTeamAbbreviation,
      slug: raw.awayTeamSlug,
      logo: raw.awayTeamLogo,
      colors: { primary: raw.awayTeamPrimaryColor, secondary: '' },
    },
    competition: {
      id: raw.competitionId,
      name: raw.competitionName,
      slug: raw.competitionSlug,
      season: raw.competitionSeason,
      logo: '',
      country: 'Kenya',
    },
    venue: {
      id: raw.venueName ?? `${raw.competitionId}-venue`,
      name: raw.venueName ?? '',
      city: raw.venueCity ?? '',
    },
    ...(hasScore ? { score: { home: raw.scoreHome!, away: raw.scoreAway! } } : {}),
    ...(raw.liveMinute != null ? { liveMinute: raw.liveMinute } : {}),
    ...(raw.preview ? { preview: raw.preview } : {}),
    homeForm: [],
    awayForm: [],
    relatedNewsSlugs: [],
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSFixturesProvider implements FixturesProvider {
  private async fetchAll(): Promise<SFixture[]> {
    const first = await strapiGet<StrapiList<SFixture>>(
      `/fixtures?sort[0]=kickoff:desc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SFixture>>(
                `/fixtures?sort[0]=kickoff:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat()
  }

  async getAllFixtures(): Promise<Fixture[]> {
    return (await this.fetchAll()).map(mapFixture)
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    const res = await strapiGet<StrapiList<SFixture>>(
      `/fixtures?filters[documentId][$eq]=${encodeURIComponent(id)}&pagination[pageSize]=1`
    )
    return res.data[0] ? mapFixture(res.data[0]) : null
  }

  async getAllCompetitions(): Promise<Competition[]> {
    const fixtures = await this.fetchAll()
    const seen = new Map<string, Competition>()
    for (const f of fixtures) {
      if (!seen.has(f.competitionId)) {
        seen.set(f.competitionId, {
          id: f.competitionId,
          name: f.competitionName,
          slug: f.competitionSlug,
          season: f.competitionSeason,
          logo: '',
          country: 'Kenya',
        })
      }
    }
    return Array.from(seen.values())
  }

  async getAllTeams(): Promise<Team[]> {
    const fixtures = await this.fetchAll()
    const seen = new Map<string, Team>()
    for (const f of fixtures) {
      if (!seen.has(f.homeTeamId)) {
        seen.set(f.homeTeamId, {
          id: f.homeTeamId, name: f.homeTeamName, shortName: f.homeTeamShortName,
          abbreviation: f.homeTeamAbbreviation, slug: f.homeTeamSlug,
          logo: f.homeTeamLogo, colors: { primary: f.homeTeamPrimaryColor, secondary: '' },
        })
      }
      if (!seen.has(f.awayTeamId)) {
        seen.set(f.awayTeamId, {
          id: f.awayTeamId, name: f.awayTeamName, shortName: f.awayTeamShortName,
          abbreviation: f.awayTeamAbbreviation, slug: f.awayTeamSlug,
          logo: f.awayTeamLogo, colors: { primary: f.awayTeamPrimaryColor, secondary: '' },
        })
      }
    }
    return Array.from(seen.values())
  }

  async getAllVenues(): Promise<Venue[]> {
    const fixtures = await this.fetchAll()
    const seen = new Map<string, Venue>()
    for (const f of fixtures) {
      if (f.venueName && !seen.has(f.venueName)) {
        seen.set(f.venueName, {
          id: f.venueName,
          name: f.venueName,
          city: f.venueCity ?? '',
        })
      }
    }
    return Array.from(seen.values())
  }
}
