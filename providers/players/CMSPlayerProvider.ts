import type { PlayerProvider } from "./PlayerProvider";

// Placeholder for a headless CMS integration.
// Swap JsonPlayerProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSPlayerProvider implements PlayerProvider {
  async getAllPlayers(): Promise<never> {
    throw new Error("CMSPlayerProvider.getAllPlayers: not implemented");
  }

  async getPlayerBySlug(_slug: string): Promise<never> {
    throw new Error("CMSPlayerProvider.getPlayerBySlug: not implemented");
  }

  async getPlayersByClub(_clubSlug: string): Promise<never> {
    throw new Error("CMSPlayerProvider.getPlayersByClub: not implemented");
  }
}
