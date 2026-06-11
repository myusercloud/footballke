import type {
  GetTransfersParams,
  ITransfersService,
  Transfer,
  TransferClub,
  TransferWindow,
  TransfersResponse,
} from "@/types/transfer";
import type { TransfersProvider } from "@/providers/transfers/TransfersProvider";
import { getTransfersProvider } from "@/providers/config";

// ── Implementation ────────────────────────────────────────────────────────────

class TransfersService implements ITransfersService {
  constructor(private readonly provider: TransfersProvider) {}

  async getTransfers(params: GetTransfersParams = {}): Promise<TransfersResponse> {
    const { status = "all", clubSlug, window, page = 1, pageSize = 20 } = params;

    let filtered = await this.provider.getAllTransfers();

    if (status !== "all") {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (window !== undefined) {
      filtered = filtered.filter((t) => t.window === window);
    }

    if (clubSlug !== undefined) {
      filtered = filtered.filter(
        (t) => t.fromClub.slug === clubSlug || t.toClub.slug === clubSlug
      );
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
      transfers: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getWindows(): Promise<TransferWindow[]> {
    const transfers = await this.provider.getAllTransfers();
    const seen = new Set<string>();
    const windows: TransferWindow[] = [];
    for (const t of transfers) {
      if (!seen.has(t.window)) {
        seen.add(t.window);
        windows.push(t.window);
      }
    }
    // Most recent first (string comparison works for "summer-2026" > "winter-2026" > "summer-2025")
    return windows.sort((a, b) => b.localeCompare(a));
  }

  async getKplClubs(): Promise<TransferClub[]> {
    const clubs = await this.provider.getAllClubs();
    return clubs.filter((c) => c.country === "Kenya");
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI code imports this. To switch backends, set CONTENT_SOURCE in .env.local.
// Provider selection lives in providers/config.ts.
// When providers/config.ts is in place, use: new TransfersService(getTransfersProvider())

const transfersService: ITransfersService = new TransfersService(getTransfersProvider());
export default transfersService;
