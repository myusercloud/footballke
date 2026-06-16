import type { Player, Position } from "@/types/player"
import type { PlayerProvider } from "./PlayerProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SMedia = { url: string; alternativeText: string | null }

type SPlayer = {
  id: number; documentId: string
  name: string; slug: string; jerseyNumber: number
  position: string; secondaryPosition: string | null
  nationalityName: string; nationalityCode: string; nationalityFlag: string
  dateOfBirth: string; height: number; preferredFoot: string
  clubId: string; clubSlug: string; clubName: string
  contractUntil: string | null; contractType: string
  image: SMedia | null; bio: string
  statsAppearances: number; statsGoals: number; statsAssists: number
  statsYellowCards: number; statsRedCards: number; statsMinutesPlayed: number
  statsCleanSheets: number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STRAPI_ORIGIN = (process.env.STRAPI_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${STRAPI_ORIGIN}${url}`
}

function computeAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  return m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? age - 1 : age
}

const PLAYER_POPULATE = 'populate[image]=true'

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapPlayer(raw: SPlayer): Player {
  return {
    id: raw.documentId,
    slug: raw.slug,
    name: raw.name,
    jerseyNumber: raw.jerseyNumber,
    position: raw.position as Position,
    secondaryPosition: raw.secondaryPosition ? (raw.secondaryPosition as Position) : null,
    nationality: {
      name: raw.nationalityName,
      code: raw.nationalityCode,
      flag: raw.nationalityFlag,
    },
    dateOfBirth: raw.dateOfBirth,
    age: computeAge(raw.dateOfBirth),
    height: raw.height,
    preferredFoot: raw.preferredFoot as 'right' | 'left' | 'both',
    clubId: raw.clubId,
    clubSlug: raw.clubSlug,
    clubName: raw.clubName,
    contract: {
      until: raw.contractUntil ?? null,
      type: raw.contractType as 'permanent' | 'loan',
    },
    image: raw.image ? mediaUrl(raw.image.url) : '',
    stats: {
      appearances: raw.statsAppearances,
      goals: raw.statsGoals,
      assists: raw.statsAssists,
      yellowCards: raw.statsYellowCards,
      redCards: raw.statsRedCards,
      minutesPlayed: raw.statsMinutesPlayed,
      ...(raw.statsCleanSheets != null ? { cleanSheets: raw.statsCleanSheets } : {}),
    },
    bio: raw.bio,
    searchableName: raw.name.toLowerCase(),
    searchableKeywords: [raw.clubName, raw.nationalityName, raw.position].filter(Boolean),
    searchableSlug: raw.slug,
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSPlayerProvider implements PlayerProvider {
  async getAllPlayers(): Promise<Player[]> {
    const first = await strapiGet<StrapiList<SPlayer>>(
      `/players?${PLAYER_POPULATE}&sort[0]=name:asc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SPlayer>>(
                `/players?${PLAYER_POPULATE}&sort[0]=name:asc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat().map(mapPlayer)
  }

  async getPlayerBySlug(slug: string): Promise<Player | null> {
    const res = await strapiGet<StrapiList<SPlayer>>(
      `/players?${PLAYER_POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`
    )
    return res.data[0] ? mapPlayer(res.data[0]) : null
  }

  async getPlayersByClub(clubSlug: string): Promise<Player[]> {
    const first = await strapiGet<StrapiList<SPlayer>>(
      `/players?${PLAYER_POPULATE}&filters[clubSlug][$eq]=${encodeURIComponent(clubSlug)}&sort[0]=jerseyNumber:asc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SPlayer>>(
                `/players?${PLAYER_POPULATE}&filters[clubSlug][$eq]=${encodeURIComponent(clubSlug)}&sort[0]=jerseyNumber:asc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat().map(mapPlayer)
  }
}
