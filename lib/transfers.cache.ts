import { cache } from "react";
import transfersService from "@/services/transfers.service";
import type { GetTransfersParams } from "@/types/transfer";

export const getTransfers = cache(
  (params: GetTransfersParams = {}) => transfersService.getTransfers(params)
);

export const getTransferWindows = cache(
  () => transfersService.getWindows()
);

export const getTransferKplClubs = cache(
  () => transfersService.getKplClubs()
);
