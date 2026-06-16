import type { Club } from "@/types/club"
import type { ClubProvider } from "./ClubProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SMedia = { url: string; alternativeText: string | null }

type SClub = {
  id: number; documentId: string
  name: string; slug: string; shortName: string; abbreviation: string
  founded: number | null; city: string; country: string
  logo: SMedia | null
  primaryColor: string; secondaryColor: string
  venueName: string | null; venueCity: string | null; venueCapacity: number | null
  description: string | null
  achievements: unknown
  twitterUrl: string | null; facebookUrl: string | null
  instagramUrl: string | null; websiteUrl: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STRAPI_ORIGIN = (process.env.STRAPI_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${STRAPI_ORIGIN}${url}`
}

const CLUB_POPULATE = 'populate[logo]=true'

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapClub(raw: SClub): Club {
  return {
    id: raw.documentId,
    slug: raw.slug,
    name: raw.name,
    shortName: raw.shortName,
    abbreviation: raw.abbreviation,
    founded: raw.founded ?? 0,
    city: raw.city,
    country: raw.country,
    logo: raw.logo ? mediaUrl(raw.logo.url) : '',
    colors: { primary: raw.primaryColor, secondary: raw.secondaryColor },
    venue: {
      id: `${raw.slug}-venue`,
      name: raw.venueName ?? '',
      city: raw.venueCity ?? raw.city,
      ...(raw.venueCapacity != null ? { capacity: raw.venueCapacity } : {}),
    },
    description: raw.description ?? '',
    achievements: Array.isArray(raw.achievements) ? (raw.achievements as string[]) : [],
    social: {
      ...(raw.twitterUrl ? { twitter: raw.twitterUrl } : {}),
      ...(raw.facebookUrl ? { facebook: raw.facebookUrl } : {}),
      ...(raw.instagramUrl ? { instagram: raw.instagramUrl } : {}),
      ...(raw.websiteUrl ? { website: raw.websiteUrl } : {}),
    },
    // Stats are not stored in Strapi; they are derived from standings data.
    // Return neutral zeros so club profile pages render without a standings query.
    stats: {
      position: 0, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [],
    },
    searchableName: raw.name.toLowerCase(),
    searchableKeywords: [raw.shortName, raw.abbreviation].filter(Boolean),
    searchableSlug: raw.slug,
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSClubProvider implements ClubProvider {
  async getAllClubs(): Promise<Club[]> {
    const first = await strapiGet<StrapiList<SClub>>(
      `/clubs?${CLUB_POPULATE}&sort[0]=name:asc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SClub>>(
                `/clubs?${CLUB_POPULATE}&sort[0]=name:asc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat().map(mapClub)
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    const res = await strapiGet<StrapiList<SClub>>(
      `/clubs?${CLUB_POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`
    )
    return res.data[0] ? mapClub(res.data[0]) : null
  }
}
