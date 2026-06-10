import type { TableZone } from "@/types/standings";

type Props = {
  points: number;
  zone: TableZone | null;
};

// Static Record — complete strings, Tailwind v4 safe
const ZONE_TEXT: Record<TableZone, string> = {
  champions:             "text-amber-700",
  continental:           "text-emerald-700",
  "continental-playoff": "text-teal-700",
  relegation:            "text-red-700",
};

export function PointsCell({ points, zone }: Props) {
  const colorClass =
    zone !== null ? ZONE_TEXT[zone] : "text-zinc-900";

  return (
    <span className={`text-sm font-black tabular-nums ${colorClass}`}>
      {points}
    </span>
  );
}
