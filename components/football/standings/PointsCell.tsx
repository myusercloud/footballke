import type { TableZone } from "@/types/standings";
import { ZONE_CLASSES } from "@/lib/standings.utils";

type Props = {
  points: number;
  zone: TableZone | null;
};

export function PointsCell({ points, zone }: Props) {
  const colorClass =
    zone !== null ? ZONE_CLASSES[zone].pointsText : "text-zinc-900";

  return (
    <span className={`text-sm font-black tabular-nums ${colorClass}`}>
      {points}
    </span>
  );
}
