import type { ZoneConfig } from "@/types/standings";
import type { TableZone } from "@/types/standings";

type Props = {
  zones: ZoneConfig[];
};

const ZONE_DOT: Record<TableZone, string> = {
  champions:             "bg-amber-400",
  continental:           "bg-emerald-600",
  "continental-playoff": "bg-teal-500",
  relegation:            "bg-red-500",
};

export function StandingsLegend({ zones }: Props) {
  if (zones.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Zone legend">
      {zones.map((z) => (
        <li key={z.type} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-sm ${ZONE_DOT[z.type]}`}
            aria-hidden="true"
          />
          <span className="text-xs text-zinc-500">{z.label}</span>
        </li>
      ))}
    </ul>
  );
}
