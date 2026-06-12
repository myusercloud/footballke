import type {
  Club,
  ClubResponse,
  GetClubsParams,
  IClubService,
} from "@/types/club";
import type { ClubProvider } from "@/providers/clubs/ClubProvider";
import { getClubProvider } from "@/providers/config";

// ── Implementation ────────────────────────────────────────────────────────────

class ClubService implements IClubService {
  constructor(private readonly provider: ClubProvider) {}

  async getClubs(params: GetClubsParams = {}): Promise<ClubResponse> {
    const { page = 1, pageSize = 20, city, featured, search } = params;

    let results = await this.provider.getAllClubs();

    // Default sort: standings position ascending
    results = [...results].sort((a, b) => a.stats.position - b.stats.position);

    if (city !== undefined) {
      const normalised = city.toLowerCase();
      results = results.filter((c) => c.city.toLowerCase() === normalised);
    }

    if (featured === true) {
      results = results.slice(0, 6);
    }

    if (search !== undefined && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.searchableName.toLowerCase().includes(q) ||
          c.searchableSlug.includes(q) ||
          c.searchableKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    return {
      clubs: results.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    return this.provider.getClubBySlug(slug);
  }

  async getFeaturedClubs(limit = 6): Promise<Club[]> {
    const clubs = await this.provider.getAllClubs();
    return [...clubs]
      .sort((a, b) => a.stats.position - b.stats.position)
      .slice(0, limit);
  }

  async getRelatedClubs(slug: string, limit = 4): Promise<Club[]> {
    const target = await this.provider.getClubBySlug(slug);
    if (!target) return [];

    const all = await this.provider.getAllClubs();
    const others = all.filter((c) => c.slug !== slug);

    // Same city first, then alphabetical by position
    const sameCity = others.filter((c) => c.city === target.city);
    const byPosition = others
      .filter((c) => c.city !== target.city)
      .sort((a, b) => a.stats.position - b.stats.position);

    return [...sameCity, ...byPosition].slice(0, limit);
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
// UI imports this directly. To switch backends set CONTENT_SOURCE in .env.local.

const clubService: IClubService = new ClubService(getClubProvider());
export default clubService;
