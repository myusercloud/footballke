import type { TransferConfidence, TransferStatus } from "@/types/transfer";

type Props = {
  status: TransferStatus;
  confidence?: TransferConfidence;
};

// Static maps — Tailwind v4 safe (complete strings)
const STATUS_STYLE: Record<TransferStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  loan:      "bg-blue-100    text-blue-800",
  rumour:    "bg-amber-100   text-amber-800",
  exit:      "bg-zinc-100    text-zinc-600",
};

const STATUS_LABEL: Record<TransferStatus, string> = {
  confirmed: "Confirmed",
  loan:      "Loan",
  rumour:    "Rumour",
  exit:      "Exit",
};

const CONFIDENCE_INDICATOR: Record<TransferConfidence, string> = {
  hot:  "🔥",
  warm: "🌡",
  cool: "❄",
};

export function TransferBadge({ status, confidence }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
      {status === "rumour" && confidence && (
        <span aria-label={`${confidence} rumour`} role="img">
          {CONFIDENCE_INDICATOR[confidence]}
        </span>
      )}
    </span>
  );
}
