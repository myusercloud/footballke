export type TransferStatus = "confirmed" | "loan" | "rumour" | "exit";

// Rumour confidence — only set when status === "rumour"
export type TransferConfidence = "hot" | "warm" | "cool";

// ID slugs used in URL params and data filtering
export type TransferWindow = "summer-2026" | "winter-2026" | "summer-2025";

// ── Entities ──────────────────────────────────────────────────────────────────

export type TransferPlayer = {
  name: string;
  position: string;    // "Striker", "Midfielder", "Centre-Back", etc.
  nationality: string; // "Kenyan", "Tanzanian", etc.
  age: number;
};

export type TransferClub = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  country: string;     // "Kenya", "Uganda", "Tanzania", "" for free agents
};

// ── Core entity ───────────────────────────────────────────────────────────────

export type Transfer = {
  id: string;
  player: TransferPlayer;
  fromClub: TransferClub;
  toClub: TransferClub;
  /** Human-readable fee string: "Free transfer", "Undisclosed", "Loan", "KSh 12M" */
  fee: string;
  status: TransferStatus;
  /** Only present when status === "rumour" */
  confidence?: TransferConfidence;
  window: TransferWindow;
  /** ISO 8601 — date confirmed or rumour surfaced */
  date: string;
  /** Attribution label shown in UI, e.g. "Goal Kenya", "KBC Sport" */
  sourceLabel?: string;
  /** Slug of a linked /news/[slug] article, if one exists */
  linkedArticleSlug?: string;
};

// ── Service params ────────────────────────────────────────────────────────────

export type GetTransfersParams = {
  status?: TransferStatus | "all";
  clubSlug?: string;
  window?: TransferWindow;
  page?: number;
  pageSize?: number;
};

export type TransfersResponse = {
  transfers: Transfer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ── Service interface ─────────────────────────────────────────────────────────

export interface ITransfersService {
  getTransfers(params?: GetTransfersParams): Promise<TransfersResponse>;
  getWindows(): Promise<TransferWindow[]>;
  getKplClubs(): Promise<TransferClub[]>;
}
