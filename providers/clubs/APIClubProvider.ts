import type { ClubProvider } from "./ClubProvider";

// Placeholder for a sports data API integration (e.g. API-Football, SportMonks).
// Implement this class once an API contract is signed and the external schema
// mapped to the Club type. The mapping lives entirely in this provider —
// the service layer is unaffected by the migration.

export class APIClubProvider implements ClubProvider {
  async getAllClubs(): Promise<never> {
    throw new Error("APIClubProvider.getAllClubs: not implemented");
  }

  async getClubBySlug(_slug: string): Promise<never> {
    throw new Error("APIClubProvider.getClubBySlug: not implemented");
  }
}
