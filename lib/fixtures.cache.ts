import { cache } from "react";
import fixturesService from "@/services/fixtures.service";
import type { GetFixturesParams } from "@/types/fixture";

// React cache() deduplicates calls within a single server render pass.
//
// Key wins:
//   getFixture(id)    — generateMetadata and page.tsx call this with the
//                       same id; without cache that is two service round-trips.
//   getCompetitions() — same deduplication pattern on the listing page.
//   getTeams()        — same.
//
// getFixtures() takes an object param; React uses reference equality so two
// separate call-sites with distinct objects won't deduplicate — intentional,
// since the listing page makes several calls with different filter sets.

export const getFixture = cache((id: string) =>
  fixturesService.getFixtureById(id)
);

export const getFixtures = cache((params: GetFixturesParams = {}) =>
  fixturesService.getFixtures(params)
);

export const getUpcomingFixtures = cache((limit?: number) =>
  fixturesService.getUpcomingFixtures(limit)
);

export const getCompletedFixtures = cache((limit?: number) =>
  fixturesService.getCompletedFixtures(limit)
);

export const getCompetitions = cache(() => fixturesService.getCompetitions());

export const getTeams = cache(() => fixturesService.getTeams());

export const getClubFixtures = cache((teamSlug: string, limit?: number) =>
  fixturesService.getClubFixtures(teamSlug, limit)
);
