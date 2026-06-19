import type { Transfer, TransferClub, TransferStatus, TransferConfidence, TransferWindow } from "@/types/transfer"
import type { TransfersProvider } from "./TransfersProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type SPlayer = {
  id: number; documentId: string
  name: string; slug: string
  position: string
  nationalityName: string
  dateOfBirth: string
}

type SClub = {
  id: number; documentId: string
  name: string; shortName: string; slug: string; country: string
}

type STransfer = {
  id: number; documentId: string
  player: SPlayer | null
  fromClub: SClub | null
  toClub: SClub | null
  fee: string | null
  transferStatus: string
  confidence: string | null
  window: string
  transferDate: string
  sourceLabel: string | null
  linkedArticleSlug: string | null
}

// ── Query ─────────────────────────────────────────────────────────────────────

const TRANSFER_POPULATE = [
  'populate[player]=*',
  'populate[fromClub]=*',
  'populate[toClub]=*',
].join('&')

// ── Helpers ───────────────────────────────────────────────────────────────────

const FREE_AGENT: TransferClub = {
  id: 'free-agent',
  name: 'Free Agent',
  shortName: 'Free Agent',
  slug: 'free-agent',
  country: '',
}

function computeAge(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function mapClub(club: SClub | null): TransferClub {
  if (!club) return FREE_AGENT
  return {
    id: club.documentId,
    name: club.name,
    shortName: club.shortName,
    slug: club.slug,
    country: club.country,
  }
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapTransfer(raw: STransfer): Transfer | null {
  if (!raw.player) return null

  return {
    id: raw.documentId,
    player: {
      name: raw.player.name,
      position: raw.player.position,
      nationality: raw.player.nationalityName,
      age: computeAge(raw.player.dateOfBirth),
    },
    fromClub: mapClub(raw.fromClub),
    toClub: mapClub(raw.toClub),
    fee: raw.fee ?? 'Undisclosed',
    status: raw.transferStatus as TransferStatus,
    ...(raw.confidence ? { confidence: raw.confidence as TransferConfidence } : {}),
    window: raw.window as TransferWindow,
    date: raw.transferDate,
    ...(raw.sourceLabel ? { sourceLabel: raw.sourceLabel } : {}),
    ...(raw.linkedArticleSlug ? { linkedArticleSlug: raw.linkedArticleSlug } : {}),
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class CMSTransfersProvider implements TransfersProvider {
  private async fetchAll(): Promise<STransfer[]> {
    try {
      const first = await strapiGet<StrapiList<STransfer>>(
        `/transfers?${TRANSFER_POPULATE}&sort[0]=transferDate:desc&pagination[pageSize]=100&pagination[page]=1`
      )
      const pages =
        first.meta.pagination.pageCount > 1
          ? await Promise.all(
              Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
                strapiGet<StrapiList<STransfer>>(
                  `/transfers?${TRANSFER_POPULATE}&sort[0]=transferDate:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
                )
              )
            )
          : []
      return [first.data, ...pages.map(p => p.data)].flat()
    } catch (err) {
      console.error('[CMSTransfersProvider] Strapi unreachable:', err)
      return []
    }
  }

  async getAllTransfers(): Promise<Transfer[]> {
    const raw = await this.fetchAll()
    return raw.flatMap(t => {
      const mapped = mapTransfer(t)
      return mapped ? [mapped] : []
    })
  }

  async getAllClubs(): Promise<TransferClub[]> {
    const transfers = await this.getAllTransfers()
    const seen = new Map<string, TransferClub>()
    for (const t of transfers) {
      if (t.fromClub.id !== 'free-agent' && !seen.has(t.fromClub.id)) {
        seen.set(t.fromClub.id, t.fromClub)
      }
      if (t.toClub.id !== 'free-agent' && !seen.has(t.toClub.id)) {
        seen.set(t.toClub.id, t.toClub)
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }
}
