import type { Player } from "@/types/player";
import type { PlayerProvider } from "./PlayerProvider";
import rawData from "@/data/players.json";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// Mirrors data/players.json. The `age` field is NOT stored in JSON —
// it is a derived value computed from dateOfBirth at read time.

type RawPlayer = Omit<Player, "age">;

type RawData = { players: RawPlayer[] };

// ── Age derivation ────────────────────────────────────────────────────────────
// floor((today − dateOfBirth) / 365.25) — consistent with the type definition.

function computeAge(dateOfBirth: string): number {
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function mapPlayer(raw: RawPlayer): Player {
  return { ...raw, age: raw.dateOfBirth ? computeAge(raw.dateOfBirth) : null };
}

// ── Implementation ────────────────────────────────────────────────────────────

export class JsonPlayerProvider implements PlayerProvider {
  private readonly players: Player[];

  constructor() {
    const data = rawData as unknown as RawData;
    this.players = data.players.map(mapPlayer);
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.players;
  }

  async getPlayerBySlug(slug: string): Promise<Player | null> {
    return this.players.find((p) => p.slug === slug) ?? null;
  }

  async getPlayersByClub(clubSlug: string): Promise<Player[]> {
    return this.players.filter((p) => p.clubSlug === clubSlug);
  }
}
