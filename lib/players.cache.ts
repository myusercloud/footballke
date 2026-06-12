import { cache } from "react";
import playerService from "@/services/player.service";
import type { GetPlayersParams } from "@/types/player";

// React cache() deduplicates calls within a single server render pass.
// Key wins: generateMetadata and page.tsx both call getPlayer() with the same
// slug — without cache() that is two provider reads per request.

export const getPlayer = cache((slug: string) =>
  playerService.getPlayerBySlug(slug)
);

export const getPlayers = cache((params: GetPlayersParams = {}) =>
  playerService.getPlayers(params)
);

export const getPlayersByClub = cache((clubSlug: string) =>
  playerService.getPlayersByClub(clubSlug)
);

export const getFeaturedPlayers = cache((limit?: number) =>
  playerService.getFeaturedPlayers(limit)
);

export const getRelatedPlayers = cache((slug: string, limit?: number) =>
  playerService.getRelatedPlayers(slug, limit)
);
