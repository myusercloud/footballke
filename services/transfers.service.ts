import type {
  GetTransfersParams,
  ITransfersService,
  Transfer,
  TransferClub,
  TransferWindow,
  TransfersResponse,
} from "@/types/transfer";
import rawData from "@/data/transfers.json";

// ── Internal JSON shape ───────────────────────────────────────────────────────

type RawTransfer = Omit<Transfer, "fromClub" | "toClub"> & {
  fromClubId: string;
  toClubId: string;
};

type RawData = {
  clubs: TransferClub[];
  transfers: RawTransfer[];
};

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapTransfer(raw: RawTransfer, clubs: TransferClub[]): Transfer {
  const fromClub = clubs.find((c) => c.id === raw.fromClubId);
  const toClub   = clubs.find((c) => c.id === raw.toClubId);

  if (!fromClub) throw new Error(`Club not found: ${raw.fromClubId} (transfer: ${raw.id})`);
  if (!toClub)   throw new Error(`Club not found: ${raw.toClubId}   (transfer: ${raw.id})`);

  const { fromClubId: _f, toClubId: _t, ...rest } = raw;
  return { ...rest, fromClub, toClub };
}

// ── Implementation ────────────────────────────────────────────────────────────

class JsonTransfersService implements ITransfersService {
  private readonly data: RawData = rawData as RawData;

  async getTransfers(params: GetTransfersParams = {}): Promise<TransfersResponse> {
    const { status = "all", clubSlug, window, page = 1, pageSize = 20 } = params;

    let filtered = this.data.transfers as RawTransfer[];

    if (status !== "all") {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (window !== undefined) {
      filtered = filtered.filter((t) => t.window === window);
    }

    if (clubSlug !== undefined) {
      const club = this.data.clubs.find((c) => c.slug === clubSlug);
      if (club) {
        filtered = filtered.filter(
          (t) => t.fromClubId === club.id || t.toClubId === club.id
        );
      } else {
        filtered = [];
      }
    }

    // Newest first
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const total      = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start      = (page - 1) * pageSize;
    const paginated  = sorted.slice(start, start + pageSize);

    return {
      transfers: paginated.map((t) => mapTransfer(t, this.data.clubs)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getWindows(): Promise<TransferWindow[]> {
    const seen = new Set<string>();
    const windows: TransferWindow[] = [];
    for (const t of this.data.transfers as RawTransfer[]) {
      if (!seen.has(t.window)) {
        seen.add(t.window);
        windows.push(t.window as TransferWindow);
      }
    }
    // Most recent first (string comparison works for "summer-2026" > "winter-2026" > "summer-2025")
    return windows.sort((a, b) => b.localeCompare(a));
  }

  async getKplClubs(): Promise<TransferClub[]> {
    return this.data.clubs.filter((c) => c.country === "Kenya");
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

const transfersService: ITransfersService = new JsonTransfersService();
export default transfersService;
