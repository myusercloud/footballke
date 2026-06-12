import { cache } from "react";
import clubService from "@/services/club.service";

// React cache() deduplicates calls within a single server render pass.
// Key wins: generateMetadata and page.tsx both call getClub() with the same
// slug — without cache() that is two provider reads per request.

export const getClub = cache((slug: string) =>
  clubService.getClubBySlug(slug)
);

export const getClubs = cache(() => clubService.getClubs({ pageSize: 20 }));

export const getFeaturedClubs = cache((limit?: number) =>
  clubService.getFeaturedClubs(limit)
);

export const getRelatedClubs = cache((slug: string, limit?: number) =>
  clubService.getRelatedClubs(slug, limit)
);
