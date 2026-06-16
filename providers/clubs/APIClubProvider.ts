import type { Club } from "@/types/club";
import type { ClubProvider } from "./ClubProvider";
import { apiFetch } from "@/providers/api-client";

type ClubListResponse = { data: Club[]; total: number; page: number; pageSize: number; totalPages: number };

export class APIClubProvider implements ClubProvider {
  async getAllClubs(): Promise<Club[]> {
    const first = await apiFetch<ClubListResponse>('/clubs?page=1&pageSize=100');
    if (first.totalPages <= 1) return first.data;
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        apiFetch<ClubListResponse>(`/clubs?page=${i + 2}&pageSize=100`)
      )
    );
    return [first.data, ...rest.map((r) => r.data)].flat();
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    try {
      return await apiFetch<Club>(`/clubs/${encodeURIComponent(slug)}`);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('404')) return null;
      throw e;
    }
  }
}
