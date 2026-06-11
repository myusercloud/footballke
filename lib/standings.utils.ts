import type { TableZone } from "@/types/standings";

// Single source of truth for zone-to-color mappings used across the app.
// Tailwind v4: every string must be complete — no runtime interpolation.
// To change the zone color scheme, edit this record only.
export const ZONE_CLASSES: Record<
  TableZone,
  {
    row: string;        // homepage widget — row left-border accent + bg tint
    posText: string;    // homepage widget — position number text color
    badgeBg: string;    // PositionBadge — badge fill
    badgeText: string;  // PositionBadge — badge text
    pointsText: string; // PointsCell — points number text color
    dot: string;        // StandingsLegend — zone indicator dot
  }
> = {
  champions: {
    row:        "border-l-[3px] border-l-amber-400 bg-amber-50/70",
    posText:    "text-amber-500",
    badgeBg:    "bg-amber-400",
    badgeText:  "text-amber-900",
    pointsText: "text-amber-700",
    dot:        "bg-amber-400",
  },
  continental: {
    row:        "border-l-[3px] border-l-emerald-500 bg-emerald-50/50",
    posText:    "text-emerald-600",
    badgeBg:    "bg-emerald-600",
    badgeText:  "text-white",
    pointsText: "text-emerald-700",
    dot:        "bg-emerald-600",
  },
  "continental-playoff": {
    row:        "border-l-[3px] border-l-teal-500 bg-teal-50/50",
    posText:    "text-teal-600",
    badgeBg:    "bg-teal-500",
    badgeText:  "text-white",
    pointsText: "text-teal-700",
    dot:        "bg-teal-500",
  },
  relegation: {
    row:        "border-l-[3px] border-l-red-500 bg-red-50/50",
    posText:    "text-red-500",
    badgeBg:    "bg-red-500",
    badgeText:  "text-white",
    pointsText: "text-red-700",
    dot:        "bg-red-500",
  },
};
