import type { TransfersProvider } from "./TransfersProvider";

// Placeholder for a headless CMS integration (e.g. Sanity, Contentful, Strapi).
// Swap JsonTransfersProvider for this class in providers/config.ts once the CMS
// schema and API client are wired up.

export class CMSTransfersProvider implements TransfersProvider {
  async getAllTransfers(): Promise<never> {
    throw new Error("CMSTransfersProvider.getAllTransfers: not implemented");
  }

  async getAllClubs(): Promise<never> {
    throw new Error("CMSTransfersProvider.getAllClubs: not implemented");
  }
}
