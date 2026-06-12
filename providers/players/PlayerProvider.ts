import type { Player } from "@/types/player";

// ── PlayerProvider ────────────────────────────────────────────────────────────
//
// Contract between the service layer and any player data source.
//
// Responsibilities:
//   - Return fully-resolved Player objects (age computed, club denormalised).
//   - No filtering, sorting, or pagination.
//
// Implementations:
//   JsonPlayerProvider   — reads data/players.json (current default)
//   CMSPlayerProvider    — headless CMS (future)
//   APIPlayerProvider    — sports data API (future)

export interface PlayerProvider {
  /** All players, fully resolved. */
  getAllPlayers(): Promise<Player[]>;

  /**
   * Single player by URL slug.
   * Returns null when no player with the given slug exists.
   */
  getPlayerBySlug(slug: string): Promise<Player | null>;

  /**
   * All players for a given club, identified by club slug.
   * Used by the service to assemble squad lists.
   */
  getPlayersByClub(clubSlug: string): Promise<Player[]>;
}
