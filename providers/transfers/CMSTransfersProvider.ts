import type { Transfer, TransferClub, TransferStatus, TransferConfidence, TransferWindow } from "@/types/transfer"
import type { TransfersProvider } from "./TransfersProvider"
import { strapiGet, type StrapiList } from "@/providers/strapi-client"

// ── Strapi v5 raw shapes ───────────────────────────────────────────────────────

type STransfer = {
  id: number; documentId: string
  playerName: string; playerPosition: string; playerNationality: string
  playerAge: number | null
  fromClubName: string | null; fromClubShortName: string | null
  fromClubSlug: string | null; fromClubCountry: string | null
  toClubName: string | null; toClubShortName: string | null
  toClubSlug: string | null; toClubCountry: string | null
  fee: string | null
  transferStatus: string
  confidence: string | null
  window: string
  transferDate: string
  sourceLabel: string | null
  linkedArticleSlug: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FREE_AGENT: TransferClub = {
  id: 'free-agent',
  name: 'Free Agent',
  shortName: 'Free Agent',
  slug: 'free-agent',
  country: '',
}

function mapClub(
  name: string | null,
  shortName: string | null,
  slug: string | null,
  country: string | null,
): TransferClub {
  if (!slug) return FREE_AGENT
  return {
    id: slug,
    name: name ?? slug,
    shortName: shortName ?? name ?? slug,
    slug,
    country: country ?? '',
  }
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapTransfer(raw: STransfer): Transfer {
  return {
    id: raw.documentId,
    player: {
      name: raw.playerName,
      position: raw.playerPosition,
      nationality: raw.playerNationality,
      age: raw.playerAge ?? 0,
    },
    fromClub: mapClub(raw.fromClubName, raw.fromClubShortName, raw.fromClubSlug, raw.fromClubCountry),
    toClub:   mapClub(raw.toClubName,   raw.toClubShortName,   raw.toClubSlug,   raw.toClubCountry),
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
  async getAllTransfers(): Promise<Transfer[]> {
    const first = await strapiGet<StrapiList<STransfer>>(
      `/transfers?sort[0]=transferDate:desc&pagination[pageSize]=100&pagination[page]=1`
    )
    const pages =
      first.meta.pagination.pageCount > 1
        ? await Promise.all(
            Array.from({ length: first.meta.pagination.pageCount - 1 }, (_, i) =>
              strapiGet<StrapiList<STransfer>>(
                `/transfers?sort[0]=transferDate:desc&pagination[pageSize]=100&pagination[page]=${i + 2}`
              )
            )
          )
        : []
    return [first.data, ...pages.map(p => p.data)].flat().map(mapTransfer)
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
