import type { TransfersProvider } from "./TransfersProvider";

// Placeholder for a transfers data API integration (e.g. TransferMarkt API,
// a custom scraper endpoint, or a sports data provider).
// Swap JsonTransfersProvider for this class in providers/config.ts once the
// API credentials and response mappings are in place.

export class APITransfersProvider implements TransfersProvider {
  async getAllTransfers(): Promise<never> {
    throw new Error("APITransfersProvider.getAllTransfers: not implemented");
  }

  async getAllClubs(): Promise<never> {
    throw new Error("APITransfersProvider.getAllClubs: not implemented");
  }
}
