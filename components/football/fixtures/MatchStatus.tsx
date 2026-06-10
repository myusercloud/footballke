import type { MatchStatus } from "@/types/fixture";
import { getStatusClasses } from "@/lib/fixture.utils";

type Props = {
  status: MatchStatus;
  liveMinute?: number;
  className?: string;
};

// Short display text — separate from getStatusLabel() which returns full words
// for headings and metadata. These are tight badge labels.
const BADGE_TEXT: Record<MatchStatus, string> = {
  scheduled: "Upcoming",
  live: "Live",
  halftime: "HT",
  fulltime: "FT",
  postponed: "PPD",
};

export function MatchStatusBadge({ status, liveMinute, className = "" }: Props) {
  const { dot, badge } = getStatusClasses(status);

  const label =
    status === "live" && liveMinute !== undefined
      ? `${liveMinute}'`
      : BADGE_TEXT[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
