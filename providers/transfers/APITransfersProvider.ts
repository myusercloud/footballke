import type { Transfer, TransferClub } from "@/types/transfer";
import type { TransfersProvider } from "./TransfersProvider";
import { apiFetch } from "@/providers/api-client";

type TransferListResponse = { data: Transfer[]; total: number; page: number; pageSize: number; totalPages: number };

export class APITransfersProvider implements TransfersProvider {
  async getAllTransfers(): Promise<Transfer[]> {
    const first = await apiFetch<TransferListResponse>('/transfers?page=1&pageSize=100');
    if (first.totalPages <= 1) return first.data;
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        apiFetch<TransferListResponse>(`/transfers?page=${i + 2}&pageSize=100`)
      )
    );
    return [first.data, ...rest.map((r) => r.data)].flat();
  }

  async getAllClubs(): Promise<TransferClub[]> {
    return apiFetch<TransferClub[]>('/transfers/clubs');
  }
}
