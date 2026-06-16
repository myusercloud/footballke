import type { Player } from "@/types/player";
import type { PlayerProvider } from "./PlayerProvider";
import { apiFetch } from "@/providers/api-client";

type PlayerListResponse = { data: Player[]; total: number; page: number; pageSize: number; totalPages: number };

export class APIPlayerProvider implements PlayerProvider {
  async getAllPlayers(): Promise<Player[]> {
    const first = await apiFetch<PlayerListResponse>('/players?page=1&pageSize=100');
    if (first.totalPages <= 1) return first.data;
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        apiFetch<PlayerListResponse>(`/players?page=${i + 2}&pageSize=100`)
      )
    );
    return [first.data, ...rest.map((r) => r.data)].flat();
  }

  async getPlayerBySlug(slug: string): Promise<Player | null> {
    try {
      return await apiFetch<Player>(`/players/${encodeURIComponent(slug)}`);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }

  async getPlayersByClub(clubSlug: string): Promise<Player[]> {
    const res = await apiFetch<PlayerListResponse>(
      `/players?clubSlug=${encodeURIComponent(clubSlug)}&page=1&pageSize=100`
    );
    return res.data;
  }
}
