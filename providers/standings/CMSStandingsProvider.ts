import type { Club, StandingsCompetition, ZoneConfig } from "@/types/standings"
import type {
  StandingsProvider,
  ProviderStandingRow,
  ProviderStandingsEntry,
} from "./StandingsProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────
//
// The `rows` JSON field must be an array of objects in this shape.
// Editors populate it directly; the clubId must match an id in getAllClubs().
//
// Example row:
// {
//   "clubId": "gor-mahia", "clubName": "Gor Mahia FC", "clubShortName": "Gor Mahia",
//   "clubSlug": "gor-mahia", "clubLogo": "https://...", "clubPrimaryColor": "#006B2D",
//   "clubSecondaryColor": "#000000", "played": 10, "won": 7, "drawn": 2, "lost": 1,
//   "goalsFor": 20, "goalsAgainst": 8, "form": ["W","W","D","W","L"]
// }

type SStandingRow = {
  clubId: string
  clubName: string; clubShortName: string; clubSlug: string
  clubLogo: string; clubPrimaryColor: string; clubSecondaryColor: string
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number
  form: string[]
}

type SStanding = {
  id: number; documentId: string
  competitionId: string; competitionName: string
  competitionSlug: string; competitionLogo: string; competitionCountry: string
  seasonId: string; seasonLabel: string
  zones: ZoneConfig[] | null
  rows: SStandingRow[]
  updatedAt: string
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSStandingsProvider implements StandingsProvider {
  private async fetchAll(): Promise<SStanding[]> {
    const first = await strapiGet<StrapiList<SStanding>>(
      `/standings?sort[0]=updatedAt:desc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SStanding>>(
                `/standings?sort[0]=updatedAt:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat()
  }

  async getAllEntries(): Promise<ProviderStandingsEntry[]> {
    const standings = await this.fetchAll()
    return standings.map((s): ProviderStandingsEntry => ({
      id: s.documentId,
      competitionId: s.competitionId,
      season: { id: s.seasonId, label: s.seasonLabel },
      zones: s.zones ?? [],
      rows: (s.rows ?? []).map((r): ProviderStandingRow => ({
        clubId: r.clubId,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        form: r.form ?? [],
      })),
      updatedAt: s.updatedAt,
    }))
  }

  async getAllClubs(): Promise<Club[]> {
    const standings = await this.fetchAll()
    const seen = new Map<string, Club>()
    for (const s of standings) {
      for (const r of s.rows ?? []) {
        if (!seen.has(r.clubId)) {
          seen.set(r.clubId, {
            id: r.clubId,
            name: r.clubName,
            shortName: r.clubShortName,
            slug: r.clubSlug,
            logo: r.clubLogo,
            colors: { primary: r.clubPrimaryColor, secondary: r.clubSecondaryColor },
          })
        }
      }
    }
    return Array.from(seen.values())
  }

  async getAllCompetitions(): Promise<StandingsCompetition[]> {
    const standings = await this.fetchAll()
    const seen = new Map<string, StandingsCompetition>()
    for (const s of standings) {
      if (!seen.has(s.competitionId)) {
        seen.set(s.competitionId, {
          id: s.competitionId,
          name: s.competitionName,
          slug: s.competitionSlug,
          logo: s.competitionLogo,
          country: s.competitionCountry,
        })
      }
    }
    return Array.from(seen.values())
  }
}
