import type { TransferStatus, TransferWindow } from "@/types/transfer";

// Canonical lists — these are the runtime arrays that back the TS union types.
// Add a new value here AND to the type in types/transfer.ts when a new window opens.
export const TRANSFER_STATUSES = [
  "confirmed", "loan", "rumour", "exit",
] as const satisfies readonly TransferStatus[];

export const TRANSFER_WINDOWS = [
  "summer-2026", "winter-2026", "summer-2025",
] as const satisfies readonly TransferWindow[];

export function parseTransferStatus(raw: string | undefined): TransferStatus | "all" {
  if (raw === "all") return "all";
  if (raw !== undefined && (TRANSFER_STATUSES as readonly string[]).includes(raw)) {
    return raw as TransferStatus;
  }
  return "all";
}

export function parseTransferWindow(raw: string | undefined): TransferWindow | "all" {
  if (raw === "all") return "all";
  if (raw !== undefined && (TRANSFER_WINDOWS as readonly string[]).includes(raw)) {
    return raw as TransferWindow;
  }
  return "all";
}
