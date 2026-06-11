import type { TableZone } from "@/types/standings";
import { ZONE_CLASSES } from "@/lib/standings.utils";

type Props = {
  position: number;
  zone: TableZone | null;
};

export function PositionBadge({ position, zone }: Props) {
  const z = zone !== null ? ZONE_CLASSES[zone] : null;

  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[11px] font-black leading-none ${
        z ? `${z.badgeBg} ${z.badgeText}` : "text-zinc-500"
      }`}
      aria-label={`Position ${position}`}
    >
      {position}
    </span>
  );
}
