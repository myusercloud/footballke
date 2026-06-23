import Image from "next/image";
import type { Team } from "@/types/fixture";

type Size = "sm" | "md" | "lg";

type Props = {
  team: Team;
  size?: Size;
};

// Static size map — Tailwind v4 safe (no interpolation)
const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
};

export function TeamBadge({ team, size = "md" }: Props) {
  if (team.logo) {
    return (
      <div
        className={`${SIZE_CLASSES[size]} relative shrink-0 overflow-hidden rounded-full`}
        role="img"
        aria-label={team.name}
      >
        <Image
          src={team.logo}
          alt={team.name}
          fill
          sizes="56px"
          className="object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_CLASSES[size]} flex shrink-0 items-center justify-center rounded-full font-black leading-none`}
      style={{
        backgroundColor: team.colors.primary,
        color: team.colors.secondary,
      }}
      role="img"
      aria-label={team.name}
    >
      {team.abbreviation}
    </div>
  );
}
