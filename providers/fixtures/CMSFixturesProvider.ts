import type { Fixture, GoalEvent, Team, Competition, Venue, MatchStatus } from "@/types/fixture"
import type { FixturesProvider } from "./FixturesProvider"
import { strapiGet, strapiMediaUrl, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SMedia = { url: string; alternativeText: string | null }

type SClub = {
  id: number; documentId: string
  name: string; slug: string; shortName: string; abbreviation: string
  primaryColor: string; secondaryColor: string
  logo: SMedia | null
  venueName: string | null; venueCity: string | null
}

type STournament = {
  id: number; documentId: string
  name: string; slug: string; shortName: string; edition: string
  emblem: SMedia | null
}

type SGoalEvent = {
  id: number
  player?: { name: string; slug: string } | null
  club?: { slug: string } | null
  minute: number
  addedTime?: number | null
  isOwnGoal?: boolean | null
  isPenalty?: boolean | null
}

type SFixture = {
  id: number; documentId: string
  matchStatus: string
  kickoff: string
  matchday: number | null
  season: string | null
  featured: boolean
  homeTeam: SClub | null
  awayTeam: SClub | null
  competition: STournament | null
  venueName: string | null; venueCity: string | null
  scoreHome: number | null; scoreAway: number | null
  liveMinute: number | null
  preview: string | null
  goalEvents: SGoalEvent[] | null
}

// ── Query ─────────────────────────────────────────────────────────────────────

const FIXTURE_POPULATE = [
  'populate[homeTeam][populate]=*',
  'populate[awayTeam][populate]=*',
  'populate[competition][populate]=*',
  'populate[goalEvents][populate][player]=true',
  'populate[goalEvents][populate][club]=true',
].join('&')

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapClub(club: SClub): Team {
  return {
    id: club.documentId,
    name: club.name,
    shortName: club.shortName,
    abbreviation: club.abbreviation,
    slug: club.slug,
    logo: club.logo ? strapiMediaUrl(club.logo.url) : '',
    colors: { primary: club.primaryColor, secondary: club.secondaryColor },
  }
}

function mapTournament(t: STournament): Competition {
  return {
    id: t.documentId,
    name: t.name,
    slug: t.slug,
    season: t.edition,
    logo: t.emblem ? strapiMediaUrl(t.emblem.url) : '',
    country: 'Kenya',
  }
}

function mapFixture(raw: SFixture): Fixture | null {
  if (!raw.homeTeam || !raw.awayTeam || !raw.competition) return null

  const hasScore = raw.scoreHome !== null && raw.scoreAway !== null

  return {
    id: raw.documentId,
    status: raw.matchStatus as MatchStatus,
    kickoff: raw.kickoff,
    ...(raw.matchday != null ? { matchday: raw.matchday } : {}),
    featured: raw.featured,
    homeTeam: mapClub(raw.homeTeam),
    awayTeam: mapClub(raw.awayTeam),
    competition: mapTournament(raw.competition),
    venue: {
      id: raw.venueName ?? raw.documentId,
      name: raw.venueName ?? '',
      city: raw.venueCity ?? '',
    },
    ...(hasScore ? { score: { home: raw.scoreHome!, away: raw.scoreAway! } } : {}),
    ...(raw.liveMinute != null ? { liveMinute: raw.liveMinute } : {}),
    ...(raw.preview ? { preview: raw.preview } : {}),
    homeForm: [],
    awayForm: [],
    relatedNewsSlugs: [],
    goalEvents: (raw.goalEvents ?? []).flatMap((g): GoalEvent[] => {
      if (!g.player || !g.club) return []
      const team = g.club.slug === raw.homeTeam?.slug ? 'home' : 'away'
      return [{
        id: String(g.id),
        playerName: g.player.name,
        playerSlug: g.player.slug,
        team,
        minute: g.minute,
        ...(g.addedTime != null ? { addedTime: g.addedTime } : {}),
        isOwnGoal: g.isOwnGoal ?? false,
        isPenalty: g.isPenalty ?? false,
      }]
    }),
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSFixturesProvider implements FixturesProvider {
  private async fetchAll(): Promise<SFixture[]> {
    try {
      const first = await strapiGet<StrapiList<SFixture>>(
        `/fixtures?${FIXTURE_POPULATE}&sort[0]=kickoff:desc&pagination[pageSize]=100&pagination[page]=1`
      )
      const pages =
        first.meta.pagination.pageCount > 1
          ? await Promise.all(
              Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
                strapiGet<StrapiList<SFixture>>(
                  `/fixtures?${FIXTURE_POPULATE}&sort[0]=kickoff:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
                )
              )
            )
          : []
      return [first.data, ...pages.map(p => p.data)].flat()
    } catch (err) {
      console.error('[CMSFixturesProvider] Strapi unreachable:', err)
      return []
    }
  }

  async getAllFixtures(): Promise<Fixture[]> {
    const raw = await this.fetchAll()
    return raw.flatMap(f => {
      const mapped = mapFixture(f)
      return mapped ? [mapped] : []
    })
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    try {
      const res = await strapiGet<StrapiList<SFixture>>(
        `/fixtures?${FIXTURE_POPULATE}&filters[documentId][$eq]=${encodeURIComponent(id)}&pagination[pageSize]=1`
      )
      const raw = res.data[0]
      return raw ? mapFixture(raw) : null
    } catch (err) {
      console.error('[CMSFixturesProvider] Strapi unreachable:', err)
      return null
    }
  }

  async getAllCompetitions(): Promise<Competition[]> {
    const fixtures = await this.getAllFixtures()
    const seen = new Map<string, Competition>()
    for (const f of fixtures) {
      if (!seen.has(f.competition.id)) seen.set(f.competition.id, f.competition)
    }
    return Array.from(seen.values())
  }

  async getAllTeams(): Promise<Team[]> {
    const fixtures = await this.getAllFixtures()
    const seen = new Map<string, Team>()
    for (const f of fixtures) {
      if (!seen.has(f.homeTeam.id)) seen.set(f.homeTeam.id, f.homeTeam)
      if (!seen.has(f.awayTeam.id)) seen.set(f.awayTeam.id, f.awayTeam)
    }
    return Array.from(seen.values())
  }

  async getAllVenues(): Promise<Venue[]> {
    const fixtures = await this.getAllFixtures()
    const seen = new Map<string, Venue>()
    for (const f of fixtures) {
      if (f.venue.name && !seen.has(f.venue.id)) seen.set(f.venue.id, f.venue)
    }
    return Array.from(seen.values())
  }
}
