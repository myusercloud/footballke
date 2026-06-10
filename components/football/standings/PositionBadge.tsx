import type { TableZone } from "@/types/standings";

type Props = {
  position: number;
  zone: TableZone | null;
};

// Static Record — complete class strings, Tailwind v4 safe.
// Keyed by TableZone string values so TypeScript catches missing branches.
const ZONE_BADGE: Record<TableZone, { bg: string; text: string }> = {
  champions:            { bg: "bg-amber-400",   text: "text-amber-900" },
  continental:          { bg: "bg-emerald-600",  text: "text-white"     },
  "continental-playoff":{ bg: "bg-teal-500",     text: "text-white"     },
  relegation:           { bg: "bg-red-500",      text: "text-white"     },
};

export function PositionBadge({ position, zone }: Props) {
  const zoneStyle = zone !== null ? ZONE_BADGE[zone] : null;

  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[11px] font-black leading-none ${
        zoneStyle
          ? `${zoneStyle.bg} ${zoneStyle.text}`
          : "text-zinc-500"
      }`}
      aria-label={`Position ${position}`}
    >
      {position}
    </span>
  );
}
