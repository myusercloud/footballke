import type { Transfer, TransferClub } from "@/types/transfer";
import rawData from "@/data/transfers.json";
import type { TransfersProvider } from "./TransfersProvider";

// ── Raw JSON shape ────────────────────────────────────────────────────────────
// Mirrors data/transfers.json exactly. The raw shape uses fromClubId /
// toClubId string references; the mapper resolves these to full TransferClub
// entities before exposing them to the service.

type RawTransfer = Omit<Transfer, "fromClub" | "toClub"> & {
  fromClubId: string;
  toClubId: string;
};

type RawData = {
  clubs: TransferClub[];
  transfers: RawTransfer[];
};

// ── Mapper ────────────────────────────────────────────────────────────────────
// Resolves fromClubId and toClubId to full TransferClub entities.
// Once resolved, the service can filter by t.fromClub.slug / t.toClub.slug
// directly — no further ID lookups needed in the service layer.
// Identical to the mapper previously embedded in services/transfers.service.ts.

function mapTransfer(raw: RawTransfer, clubs: TransferClub[]): Transfer {
  const fromClub = clubs.find((c) => c.id === raw.fromClubId);
  const toClub   = clubs.find((c) => c.id === raw.toClubId);

  if (!fromClub)
    throw new Error(`Club not found: ${raw.fromClubId} (transfer: ${raw.id})`);
  if (!toClub)
    throw new Error(`Club not found: ${raw.toClubId} (transfer: ${raw.id})`);

  const { fromClubId: _f, toClubId: _t, ...rest } = raw;
  return { ...rest, fromClub, toClub };
}

// ── Implementation ────────────────────────────────────────────────────────────

export class JsonTransfersProvider implements TransfersProvider {
  private readonly data: RawData = rawData as RawData;

  async getAllTransfers(): Promise<Transfer[]> {
    return this.data.transfers.map((t) => mapTransfer(t, this.data.clubs));
  }

  async getAllClubs(): Promise<TransferClub[]> {
    return this.data.clubs;
  }
}
