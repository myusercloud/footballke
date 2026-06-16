import type { Article, Author, Category, ContentBlock, CategoryColor } from "@/types/news"
import type { NewsProvider } from "./NewsProvider"
import { calculateReadingTime } from "@/lib/news.utils"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SNode = { type: string; text?: string; bold?: boolean; italic?: boolean; children?: SNode[] }

type SMedia = {
  id: number; documentId: string
  url: string; alternativeText: string | null
  width: number | null; height: number | null
}

type SRichBlock = {
  type: string; level?: number; format?: 'ordered' | 'unordered'
  children: SNode[]
  image?: { url: string; alternativeText: string | null; caption: string | null }
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

function extractText(nodes: SNode[]): string {
  return nodes
    .map(n => n.type === 'text' ? (n.text ?? '') : n.children ? extractText(n.children) : '')
    .join('')
}

function mapContentFromString(text: string): ContentBlock[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => ({ type: 'paragraph' as const, text: p }))
}

function mapContent(blocks: SRichBlock[] | string | null): ContentBlock[] {
  if (!blocks) return []
  if (typeof blocks === 'string') return mapContentFromString(blocks)
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap((b): ContentBlock[] => {
    switch (b.type) {
      case 'paragraph': {
        const text = extractText(b.children)
        return text.trim() ? [{ type: 'paragraph', text }] : []
      }
      case 'heading': {
        const text = extractText(b.children)
        const level = Math.min(Math.max(b.level ?? 2, 2), 4) as 2 | 3 | 4
        return text.trim() ? [{ type: 'heading', level, text }] : []
      }
      case 'image': {
        if (!b.image?.url) return []
        return [{
          type: 'image',
          src: mediaUrl(b.image.url),
          alt: b.image.alternativeText ?? '',
          ...(b.image.caption ? { caption: b.image.caption } : {}),
        }]
      }
      case 'quote': {
        const text = extractText(b.children)
        return text.trim() ? [{ type: 'quote', text }] : []
      }
      case 'list': {
        const items = b.children
          .map(item => extractText(item.children ?? []))
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
