import type { Competition, Fixture, Team, Venue } from "@/types/fixture";
import type { FixturesProvider } from "./FixturesProvider";
import { apiFetch } from "@/providers/api-client";

type FixtureListResponse = { data: Fixture[]; total: number; page: number; pageSize: number; totalPages: number };

async function fetchAllPages(base: string): Promise<Fixture[]> {
  const first = await apiFetch<FixtureListResponse>(`${base}&page=1&pageSize=100`);
  if (first.totalPages <= 1) return first.data;
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) =>
      apiFetch<FixtureListResponse>(`${base}&page=${i + 2}&pageSize=100`)
    )
  );
  return [first.data, ...rest.map((r) => r.data)].flat();
}

export class APIFixturesProvider implements FixturesProvider {
  async getAllFixtures(): Promise<Fixture[]> {
    return fetchAllPages('/fixtures?');
  }

  async getFixtureById(id: string): Promise<Fixture | null> {
    try {
      return await apiFetch<Fixture>(`/fixtures/${encodeURIComponent(id)}`);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }

  async getAllCompetitions(): Promise<Competition[]> {
    return apiFetch<Competition[]>('/fixtures/competitions');
  }

  async getAllTeams(): Promise<Team[]> {
    return apiFetch<Team[]>('/fixtures/teams');
  }

  async getAllVenues(): Promise<Venue[]> {
    // Venues are not exposed as a separate endpoint; derive from fixtures
    const fixtures = await this.getAllFixtures();
    const seen = new Map<string, Venue>();
    for (const f of fixtures) {
      if (!seen.has(f.venue.id)) seen.set(f.venue.id, f.venue);
    }
    return Array.from(seen.values());
  }
}
