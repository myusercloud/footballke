import type { PlayerProvider } from "./PlayerProvider";

// Placeholder for a sports data API integration.
// Implement once an API contract is in place. The external schema ↔ Player
// mapping lives entirely here — no leakage into the service layer.

export class APIPlayerProvider implements PlayerProvider {
  async getAllPlayers(): Promise<never> {
    throw new Error("APIPlayerProvider.getAllPlayers: not implemented");
  }

  async getPlayerBySlug(_slug: string): Promise<never> {
    throw new Error("APIPlayerProvider.getPlayerBySlug: not implemented");
  }

  async getPlayersByClub(_clubSlug: string): Promise<never> {
    throw new Error("APIPlayerProvider.getPlayersByClub: not implemented");
  }
}
