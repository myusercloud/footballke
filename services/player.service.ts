import type {
  Player,
  PlayerResponse,
  GetPlayersParams,
  IPlayerService,
  Position,
  PositionCategory,
} from "@/types/player";
import type { PlayerProvider } from "@/providers/players/PlayerProvider";
import { getPlayerProvider } from "@/providers/config";

// ── Position → Category lookup ────────────────────────────────────────────────
// Used for filtering and squad grouping. Defined once here so every method
// references the same source of truth.

const POSITION_CATEGORIES: Record<Position, PositionCategory> = {
  "Goalkeeper":           "goalkeeper",
  "Centre-Back":          "defender",
  "Left-Back":            "defender",
  "Right-Back":           "defender",
  "Wing-Back":            "defender",
  "Defensive Midfielder": "midfielder",
  "Central Midfielder":   "midfielder",
  "Attacking Midfielder": "midfielder",
  "Left Midfielder":      "midfielder",
  "Right Midfielder":     "midfielder",
  "Striker":              "forward",
  "Second Striker":       "forward",
  "Left Winger":          "forward",
  "Right Winger":         "forward",
};

// Display order for squad pages: GK → DEF → MID → FWD
const CATEGORY_ORDER: Record<PositionCategory, number> = {
  goalkeeper: 0,
  defender:   1,
  midfielder: 2,
  forward:    3,
};

function bySquadOrder(a: Player, b: Player): number {
  const catDiff =
    CATEGORY_ORDER[POSITION_CATEGORIES[a.position]] -
    CATEGORY_ORDER[POSITION_CATEGORIES[b.position]];
  return catDiff !== 0 ? catDiff : a.jerseyNumber - b.jerseyNumber;
}

// ── Implementation ────────────────────────────────────────────────────────────

class PlayerService implements IPlayerService {
  constructor(private readonly provider: PlayerProvider) {}

  async getPlayers(params: GetPlayersParams = {}): Promise<PlayerResponse> {
    const {
      page = 1,
      pageSize = 20,
      clubSlug,
      positionCategory,
      nationality,
      featured,
    } = params;

    let results = await this.provider.getAllPlayers();

    if (clubSlug !== undefined) {
      results = results.filter((p) => p.clubSlug === clubSlug);
    }

    if (positionCategory !== undefined) {
      results = results.filter(
        (p) => POSITION_CATEGORIES[p.position] === positionCategory
      );
    }

    if (nationality !== undefined) {
      results = results.filter((p) => p.nationality.code === nationality);
    }

    if (featured === true) {
      results = [...results]
        .sort((a, b) => b.stats.goals - a.stats.goals || b.stats.assists - a.stats.assists)
        .slice(0, 10);
    } else {
      results = [...results].sort(bySquadOrder);
    }

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    return {
      players: results.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getPlayerBySlug(slug: string): Promise<Player | null> {
    return this.provider.getPlayerBySlug(slug);
  }

  async getPlayersByClub(clubSlug: string): Promise<Player[]> {
    const players = await this.provider.getPlayersByClub(clubSlug);
    return [...players].sort(bySquadOrder);
  }

  async getFeaturedPlayers(limit = 8): Promise<Player[]> {
    const players = await this.provider.getAllPlayers();
    return [...players]
      .sort((a, b) => b.stats.goals - a.stats.goals || b.stats.assists - a.stats.assists)
      .slice(0, limit);
  }

  async getRelatedPlayers(slug: string, limit = 4): Promise<Player[]> {
    const target = await this.provider.getPlayerBySlug(slug);
    if (!target) return [];

    const all = await this.provider.getAllPlayers();
    const others = all.filter((p) => p.slug !== slug);

    // Same club first, then same position category from other clubs
    const sameClub = others.filter((p) => p.clubSlug === target.clubSlug);
    const sameCategory = others.filter(
      (p) =>
        p.clubSlug !== target.clubSlug &&
        POSITION_CATEGORIES[p.position] === POSITION_CATEGORIES[target.position]
    );

    return [...sameClub, ...sameCategory].slice(0, limit);
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

const playerService: IPlayerService = new PlayerService(getPlayerProvider());
export default playerService;
