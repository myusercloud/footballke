import type { MatchStatus } from "@/types/fixture";

// ── Date / time ───────────────────────────────────────────────────────────────

const TZ = "Africa/Nairobi";

/** "15:00" */
export function formatKickoffTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** "Sat, 14 Jun" */
export function formatKickoffShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

/** "Saturday, 14 June 2026" — for <title> and headings */
export function formatKickoffFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  });
}

/**
 * Section-header label: "Today", "Tomorrow", or "Sat 14 Jun".
 * Compares calendar dates in Africa/Nairobi timezone.
 */
export function formatMatchDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  const toDateParts = (date: Date) =>
    date
      .toLocaleDateString("en-CA", { timeZone: TZ }) // "YYYY-MM-DD"
      .split("-")
      .map(Number);

  const [dy, dm, dd] = toDateParts(d);
  const [ny, nm, nd] = toDateParts(now);

  if (dy === ny && dm === nm && dd === nd) return "Today";

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [ty, tm, td] = toDateParts(tomorrow);
  if (dy === ty && dm === tm && dd === td) return "Tomorrow";

  return d.toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

/** Returns true when the kickoff falls on today's calendar date (EAT). */
export function isToday(iso: string): boolean {
  const toDate = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: TZ });
  return toDate(new Date(iso)) === toDate(new Date());
}

/** ISO date key "YYYY-MM-DD" (EAT) — for grouping fixtures by day. */
export function kickoffDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  halftime: "Half Time",
  fulltime: "Full Time",
  postponed: "Postponed",
};

export function getStatusLabel(status: MatchStatus): string {
  return STATUS_LABELS[status];
}

// Static class map — no dynamic Tailwind interpolation (Tailwind v4 safe).
export type StatusClasses = {
  /** Coloured dot indicator */
  dot: string;
  /** Pill / badge background + text */
  badge: string;
  /** Standalone text colour */
  text: string;
};

const STATUS_CLASSES: Record<MatchStatus, StatusClasses> = {
  scheduled: {
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600",
    text: "text-zinc-500",
  },
  live: {
    dot: "bg-red-500 animate-pulse",
    badge: "bg-red-100 text-red-700",
    text: "text-red-600",
  },
  halftime: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    text: "text-amber-600",
  },
  fulltime: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-600",
  },
  postponed: {
    dot: "bg-zinc-300",
    badge: "bg-zinc-100 text-zinc-400",
    text: "text-zinc-400",
  },
};

export function getStatusClasses(status: MatchStatus): StatusClasses {
  return STATUS_CLASSES[status];
}

// ── Form results ──────────────────────────────────────────────────────────────

export type FormResultClasses = {
  cell: string;  // background + text colour for the badge cell
  ariaLabel: string;
};

// Static map — complete class strings for Tailwind v4 compatibility.
const FORM_CLASSES: Record<string, FormResultClasses> = {
  W: { cell: "bg-emerald-600 text-white", ariaLabel: "Win" },
  D: { cell: "bg-amber-400 text-amber-900", ariaLabel: "Draw" },
  L: { cell: "bg-red-500 text-white", ariaLabel: "Loss" },
};

const FORM_FALLBACK: FormResultClasses = {
  cell: "bg-zinc-200 text-zinc-500",
  ariaLabel: "Unknown",
};

export function getFormClasses(result: string): FormResultClasses {
  return FORM_CLASSES[result] ?? FORM_FALLBACK;
}
