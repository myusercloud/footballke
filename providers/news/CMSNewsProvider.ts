import type { Article, Author, Category, ContentBlock, InlineNode, CategoryColor } from "@/types/news"
import type { NewsProvider } from "./NewsProvider"
import { calculateReadingTime } from "@/lib/news.utils"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

// Strapi BlocksEditor / TipTap shared node type
type SNode = {
  type: string
  text?: string; bold?: boolean; italic?: boolean
  // TipTap mention attrs
  attrs?: {
    id?: string; entityType?: string; entitySlug?: string
    entityName?: string; href?: string
  }
  children?: SNode[]
  // Strapi Blocks image embedded in block
  image?: { url: string; alternativeText: string | null; caption: string | null }
}

type SMedia = {
  id: number; documentId: string
  url: string; alternativeText: string | null
  width: number | null; height: number | null
}

// TipTap JSON top-level document shape
type TipTapDoc = { type: 'doc'; content: SRichBlock[] }

type SRichBlock = {
  type: string; level?: number; format?: 'ordered' | 'unordered'
  content?: SNode[]   // TipTap uses `content`
  children?: SNode[]  // Strapi Blocks uses `children`
  image?: { url: string; alternativeText: string | null; caption: string | null }
  attrs?: Record<string, unknown>
}

type SAuthor = {
  id: number; documentId: string
  name: string; role: string; bio: string | null
  avatar: SMedia | null
}

type SCategory = {
  id: number; documentId: string
  name: string; slug: string; color: string
}

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

// ── Query helpers ─────────────────────────────────────────────────────────────

const ARTICLE_POPULATE = [
  'populate[coverImage]=true',
  'populate[category]=true',
  'populate[author][populate][avatar]=true',
].join('&')

const STRAPI_ORIGIN = (process.env.STRAPI_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function mediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${STRAPI_ORIGIN}${url}`
}

// ── Mappers ───────────────────────────────────────────────────────────────────

/** Normalise: TipTap uses `content`, Strapi Blocks uses `children`. */
function childNodes(b: SRichBlock | SNode): SNode[] {
  return (b as SRichBlock).content ?? (b as SRichBlock).children ?? []
}

/** Flatten a node tree to plain text (used for headings, quotes, list items). */
function extractText(nodes: SNode[]): string {
  return nodes
    .map(n => n.type === 'text' ? (n.text ?? '') : extractText(childNodes(n as SRichBlock)))
    .join('')
}

/**
 * Convert inline nodes (text + mention) to InlineNode[].
 * Returns null when the nodes contain no mentions (use plain paragraph instead).
 */
function mapInlineNodes(nodes: SNode[]): InlineNode[] | null {
  let hasMention = false
  const result: InlineNode[] = nodes.map(n => {
    if (n.type === 'mention') {
      hasMention = true
      return {
        type:       'mention',
        entityType: (n.attrs?.entityType ?? 'player') as 'player' | 'club',
        entitySlug: n.attrs?.entitySlug ?? n.attrs?.id ?? '',
        entityName: n.attrs?.entityName ?? n.attrs?.id ?? '',
        href:       n.attrs?.href ?? `/${n.attrs?.entityType ?? 'players'}/${n.attrs?.entitySlug ?? ''}`,
      }
    }
    return { type: 'text', text: n.text ?? '', bold: n.bold, italic: n.italic }
  })
  return hasMention ? result : null
}

function mapContentFromString(text: string): ContentBlock[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => ({ type: 'paragraph' as const, text: p }))
}

/**
 * Parse the article `content` field.
 * Accepts: TipTap JSON string, Strapi Blocks array, plain Markdown string, or null.
 */
function mapContent(raw: SRichBlock[] | string | null): ContentBlock[] {
  if (!raw) return []

  // TipTap JSON stored as a string — parse and recurse
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.type === 'doc' && Array.isArray(parsed.content)) {
        return mapContent(parsed.content as SRichBlock[])
      }
    } catch { /* fall through to plain-text handling */ }
    return mapContentFromString(raw)
  }

  if (!Array.isArray(raw)) return []

  return raw.flatMap((b): ContentBlock[] => {
    const nodes = childNodes(b)

    switch (b.type) {
      case 'paragraph': {
        if (!nodes.length) return []
        const inline = mapInlineNodes(nodes)
        if (inline) return [{ type: 'rich-paragraph', children: inline }]
        const text = extractText(nodes)
        return text.trim() ? [{ type: 'paragraph', text }] : []
      }

      case 'heading': {
        const text = extractText(nodes)
        const level = Math.min(Math.max(b.level ?? (b.attrs?.level as number) ?? 2, 2), 4) as 2 | 3 | 4
        return text.trim() ? [{ type: 'heading', level, text }] : []
      }

      case 'image': {
        if (!b.image?.url) return []
        return [{
          type: 'image',
          src:  mediaUrl(b.image.url),
          alt:  b.image.alternativeText ?? '',
          ...(b.image.caption ? { caption: b.image.caption } : {}),
        }]
      }

      case 'blockquote': {
        const text = extractText(nodes)
        return text.trim() ? [{ type: 'quote', text }] : []
      }

      case 'quote': {
        const text = extractText(nodes)
        return text.trim() ? [{ type: 'quote', text }] : []
      }

      case 'bulletList':
      case 'orderedList': {
        const items = nodes
          .map(item => extractText(childNodes(item as SRichBlock)))
          .filter(Boolean)
        const ordered = b.type === 'orderedList' || b.format === 'ordered'
        return items.length ? [{ type: 'list', ordered, items }] : []
      }

      case 'list': {
        const items = nodes
          .map(item => extractText(childNodes(item as SRichBlock)))
          .filter(Boolean)
        return items.length ? [{ type: 'list', ordered: b.format === 'ordered', items }] : []
      }

      default:
        return []
    }
  })
}

function mapAuthor(raw: SAuthor): Author {
  return {
    id: raw.documentId,
    name: raw.name,
    role: raw.role,
    ...(raw.bio ? { bio: raw.bio } : {}),
    ...(raw.avatar ? {
      avatar: {
        src: mediaUrl(raw.avatar.url),
        alt: raw.avatar.alternativeText ?? raw.name,
        width: raw.avatar.width ?? 64,
        height: raw.avatar.height ?? 64,
      },
    } : {}),
  }
}

function mapCategory(raw: SCategory): Category {
  const VALID_COLORS: CategoryColor[] = ['emerald', 'amber', 'blue', 'purple', 'red', 'lime', 'zinc']
  const color = VALID_COLORS.includes(raw.color as CategoryColor)
    ? (raw.color as CategoryColor)
    : 'zinc'
  return { id: raw.documentId, name: raw.name, slug: raw.slug, color }
}

const FALLBACK_AUTHOR: Author = { id: 'editorial', name: 'Editorial Team', role: 'Editor' }
const FALLBACK_CATEGORY: Category = { id: 'general', name: 'General', slug: 'general', color: 'zinc' }

function mapArticle(raw: SArticle): Article {
  const content = mapContent(raw.content)
  return {
    id: raw.documentId,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content,
    coverImage: raw.coverImage
      ? {
          src: mediaUrl(raw.coverImage.url),
          alt: raw.coverImage.alternativeText ?? raw.title,
          width: raw.coverImage.width ?? 1200,
          height: raw.coverImage.height ?? 630,
        }
      : { src: '', alt: raw.title, width: 1200, height: 630 },
    author: raw.author ? mapAuthor(raw.author) : FALLBACK_AUTHOR,
    category: raw.category ? mapCategory(raw.category) : FALLBACK_CATEGORY,
    tags: [],
    publishedAt: raw.publishedAt ?? raw.createdAt,
    updatedAt: raw.updatedAt,
    featured: raw.featured ?? false,
    relatedSlugs: [],
    readingTime: calculateReadingTime(content),
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSNewsProvider implements NewsProvider {
  async getAllArticles(): Promise<Article[]> {
    const first = await strapiGet<StrapiList<SArticle>>(
      `/articles?${ARTICLE_POPULATE}&sort[0]=publishedAt:desc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<SArticle>>(
                `/articles?${ARTICLE_POPULATE}&sort[0]=publishedAt:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []

    return [first.data, ...pages.map(p => p.data)].flat().map(mapArticle)
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const res = await strapiGet<StrapiList<SArticle>>(
      `/articles?${ARTICLE_POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`
    )
    return res.data[0] ? mapArticle(res.data[0]) : null
  }

  async getAllCategories(): Promise<Category[]> {
    const res = await strapiGet<StrapiList<SCategory>>('/categories?pagination[pageSize]=100')
    return res.data.map(mapCategory)
  }

  async getAllAuthors(): Promise<Author[]> {
    const res = await strapiGet<StrapiList<SAuthor>>('/authors?populate[avatar]=true&pagination[pageSize]=100')
    return res.data.map(mapAuthor)
  }
}
