import type { ZoneConfig } from "@/types/standings";
import { ZONE_CLASSES } from "@/lib/standings.utils";

type Props = {
  zones: ZoneConfig[];
};

export function StandingsLegend({ zones }: Props) {
  if (zones.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Zone legend">
      {zones.map((z) => (
        <li key={z.type} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-sm ${ZONE_CLASSES[z.type].dot}`}
            aria-hidden="true"
          />
          <span className="text-xs text-zinc-500">{z.label}</span>
        </li>
      ))}
    </ul>
  );
}
