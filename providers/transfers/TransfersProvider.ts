import type { Transfer, TransferClub } from "@/types/transfer";

// ── TransfersProvider ─────────────────────────────────────────────────────────
//
// Contract between the service layer and any transfers data source.
//
// Responsibilities:
//   - Return fully-resolved Transfer objects (fromClub and toClub already
//     joined — no raw ID references exposed to the service).
//   - No filtering by status, window, or club.
//   - No sorting or pagination.
//
// The service can filter resolved transfers by slug directly:
//   t.fromClub.slug === clubSlug || t.toClub.slug === clubSlug
// This removes the need for the service to perform a separate ID-based lookup.
//
// Implementations:
//   JsonTransfersProvider   — reads data/transfers.json (current default)
//   CMSTransfersProvider    — reads from a headless CMS (future)
//   APITransfersProvider    — reads from a REST API (future)

export interface TransfersProvider {
  /**
   * All transfers, fully resolved (fromClub and toClub are full entities).
   * The service filters by status/window/club and handles pagination.
   */
  getAllTransfers(): Promise<Transfer[]>;

  /**
   * All clubs in the data source.
   * Used by the service to implement getKplClubs() (filter by country === "Kenya").
   */
  getAllClubs(): Promise<TransferClub[]>;
}
