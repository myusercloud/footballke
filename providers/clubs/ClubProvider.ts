import type { Club } from "@/types/club";

// ── ClubProvider ──────────────────────────────────────────────────────────────
//
// Contract between the service layer and any club data source.
//
// Responsibilities:
//   - Return fully-resolved Club objects — no raw ID references exposed.
//   - No filtering, sorting, or pagination (that lives in the service layer).
//
// Implementations:
//   JsonClubProvider   — reads data/clubs.json (current default)
//   CMSClubProvider    — reads from a headless CMS (future)
//   APIClubProvider    — reads from a sports data API (future)

export interface ClubProvider {
  /** All clubs, fully resolved. */
  getAllClubs(): Promise<Club[]>;

  /**
   * Single club by URL slug.
   * Returns null when no club with the given slug exists.
   */
  getClubBySlug(slug: string): Promise<Club | null>;
}
