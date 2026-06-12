import type { Club, ClubSocial } from "@/types/club";
import type { ClubProvider } from "./ClubProvider";
import rawData from "@/data/clubs.json";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// Mirrors data/clubs.json exactly. Private to this module.
// Social links may be null in JSON where not disclosed — mapped to undefined
// so the output matches ClubSocial (optional fields, never null).

type RawSocial = {
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  website?: string | null;
};

type RawClub = Omit<Club, "social"> & { social: RawSocial };

type RawData = { clubs: RawClub[] };

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapSocial(raw: RawSocial): ClubSocial {
  return {
    ...(raw.twitter != null  && { twitter:   raw.twitter }),
    ...(raw.facebook != null && { facebook:  raw.facebook }),
    ...(raw.instagram != null && { instagram: raw.instagram }),
    ...(raw.website != null  && { website:   raw.website }),
  };
}

function mapClub(raw: RawClub): Club {
  return { ...raw, social: mapSocial(raw.social) };
}

// ── Implementation ────────────────────────────────────────────────────────────

export class JsonClubProvider implements ClubProvider {
  private readonly clubs: Club[];

  constructor() {
    const data = rawData as unknown as RawData;
    this.clubs = data.clubs.map(mapClub);
  }

  async getAllClubs(): Promise<Club[]> {
    return this.clubs;
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    return this.clubs.find((c) => c.slug === slug) ?? null;
  }
}
