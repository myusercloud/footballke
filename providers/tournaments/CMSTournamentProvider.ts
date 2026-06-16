import type { TournamentProvider } from "./TournamentProvider"
import type { Tournament, TournamentStage } from "@/types/tournament"
import type { Article, ContentBlock, CategoryColor } from "@/types/news"
import { calculateReadingTime } from "@/lib/news.utils"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SMedia = {
  url: string; alternativeText: string | null
  width: number | null; height: number | null
}

type STournament = {
  id: number; documentId: string
  name: string; slug: string; shortName: string; edition: string
  emblem: SMedia | null
  totalTeams: number; featured: boolean
  hostCountries: string[] | null; hostCities: string[] | null
  startDate: string; endDate: string
  groupStageEnd: string | null; knockoutStart: string | null
  currentPhase: string
}

// Article shapes (minimal — mirrors CMSNewsProvider for category-filtered news)
type SNode = { type: string; text?: string; children?: SNode[] }
type SRichBlock = { type: string; level?: number; format?: 'ordered' | 'unordered'; children: SNode[]; image?: { url: string; alternativeText: string | null; caption: string | null } }
type SAuthor = { id: number; documentId: string; name: string; role: string; bio: string | null; avatar: SMedia | null }
type SCategory = { id: number; documentId: string; name: string; slug: string; color: string }
type SArticle = {
  id: number; documentId: string
  title: string; slug: string; excerpt: string
  content: SRichBlock[] | string | null
  featured: boolean
  publishedAt: string | null; updatedAt: string; createdAt: string
  coverImage: SMedia | null
  author: SAuthor | null
  category: SCategory | null
}

const ARTICLE_POPULATE = [
  'populate[coverImage]=true',
  'populate[category]=true',
  'populate[author][populate][avatar]=true',
].join('&')

// ── Helpers ───────────────────────────────────────────────────────────────────

const STRAPI_ORIGIN = (process.env.STRAPI_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${STRAPI_ORIGIN}${url}`
}

function extractText(nodes: SNode[]): string {
  return nodes.map(n => n.type === 'text' ? (n.text ?? '') : n.children ? extractText(n.children) : '').join('')
}

function mapContent(blocks: SRichBlock[] | string | null): ContentBlock[] {
  if (!blocks) return []
  if (typeof blocks === 'string') return blocks.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(p => ({ type: 'paragraph' as const, text: p }))
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap((b): ContentBlock[] => {
    switch (b.type) {
      case 'paragraph': { const t = extractText(b.children); return t.trim() ? [{ type: 'paragraph', text: t }] : [] }
      case 'heading':   { const t = extractText(b.children); const l = Math.min(Math.max(b.level ?? 2, 2), 4) as 2|3|4; return t.trim() ? [{ type: 'heading', level: l, text: t }] : [] }
      case 'image':     { if (!b.image?.url) return []; return [{ type: 'image', src: mediaUrl(b.image.url), alt: b.image.alternativeText ?? '', ...(b.image.caption ? { caption: b.image.caption } : {}) }] }
      case 'quote':     { const t = extractText(b.children); return t.trim() ? [{ type: 'quote', text: t }] : [] }
      case 'list':      { const items = b.children.map(i => extractText(i.children ?? [])).filter(Boolean); return items.length ? [{ type: 'list', ordered: b.format === 'ordered', items }] : [] }
      default: return []
    }
  })
}

function mapArticle(raw: SArticle): Article {
  const VALID: CategoryColor[] = ['emerald', 'amber', 'blue', 'purple', 'red', 'lime', 'zinc']
  const content = mapContent(raw.content)
  return {
    id: raw.documentId,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content,
    coverImage: raw.coverImage
      ? { src: mediaUrl(raw.coverImage.url), alt: raw.coverImage.alternativeText ?? raw.title, width: raw.coverImage.width ?? 1200, height: raw.coverImage.height ?? 630 }
      : { src: '', alt: raw.title, width: 1200, height: 630 },
    author: raw.author
      ? { id: raw.author.documentId, name: raw.author.name, role: raw.author.role, ...(raw.author.bio ? { bio: raw.author.bio } : {}), ...(raw.author.avatar ? { avatar: { src: mediaUrl(raw.author.avatar.url), alt: raw.author.avatar.alternativeText ?? raw.author.name, width: raw.author.avatar.width ?? 64, height: raw.author.avatar.height ?? 64 } } : {}) }
      : { id: 'editorial', name: 'Editorial Team', role: 'Editor' },
    category: raw.category
      ? { id: raw.category.documentId, name: raw.category.name, slug: raw.category.slug, color: VALID.includes(raw.category.color as CategoryColor) ? raw.category.color as CategoryColor : 'zinc' }
      : { id: 'general', name: 'General', slug: 'general', color: 'zinc' },
    tags: [],
    publishedAt: raw.publishedAt ?? raw.createdAt,
    updatedAt: raw.updatedAt,
    featured: raw.featured ?? false,
    relatedSlugs: [],
    readingTime: calculateReadingTime(content),
  }
}

// ── NOT_IMPL stubs ─────────────────────────────────────────────────────────────
//
// The full tournament system (groups, fixtures, players, standings) is modelled
// in the NestJS API/Prisma layer, not in Strapi. Use TOURNAMENT_SOURCE=api for
// those features. Only basic tournament metadata and news are available via CMS.

const NOT_IMPL = (name: string) => () =>
  Promise.reject(new Error(`CMSTournamentProvider.${name}: not implemented — use TOURNAMENT_SOURCE=api`))

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSTournamentProvider implements TournamentProvider {
  async getTournament(): Promise<Tournament> {
    const res = await strapiGet<StrapiList<STournament>>(
      `/tournaments?populate[emblem]=true&pagination[pageSize]=1&sort[0]=createdAt:desc`
    )
    const raw = res.data[0]
    if (!raw) throw new Error('No tournament found in Strapi CMS')
    return {
      id: raw.documentId,
      slug: raw.slug,
      name: raw.name,
      shortName: raw.shortName,
      edition: raw.edition,
      emblem: raw.emblem ? mediaUrl(raw.emblem.url) : '',
      totalTeams: raw.totalTeams,
      featured: raw.featured,
      host: {
        countries: raw.hostCountries ?? [],
        cities: raw.hostCities ?? [],
        venues: [],
      },
      dates: {
        start: raw.startDate,
        end: raw.endDate,
        ...(raw.groupStageEnd ? { groupStageEnd: raw.groupStageEnd } : {}),
        ...(raw.knockoutStart ? { knockoutStart: raw.knockoutStart } : {}),
      },
      currentPhase: raw.currentPhase as TournamentStage,
      groups: [],
    }
  }

  async getLatestNews(limit = 10): Promise<Article[]> {
    const res = await strapiGet<StrapiList<SArticle>>(
      `/articles?${ARTICLE_POPULATE}&filters[category][slug][$eq]=world-cup&sort[0]=publishedAt:desc&pagination[pageSize]=${limit}`
    )
    return res.data.map(mapArticle)
  }

  getGroups          = NOT_IMPL("getGroups")
  getFixtures        = NOT_IMPL("getFixtures")
  getGroupStandings  = NOT_IMPL("getGroupStandings")
  getTopScorers      = NOT_IMPL("getTopScorers")
  getFeaturedPlayers = NOT_IMPL("getFeaturedPlayers")
  getTeamBySlug      = NOT_IMPL("getTeamBySlug")
  getPlayerBySlug    = NOT_IMPL("getPlayerBySlug")
  getKnockoutRounds  = NOT_IMPL("getKnockoutRounds")
  getSquad           = NOT_IMPL("getSquad")
}
