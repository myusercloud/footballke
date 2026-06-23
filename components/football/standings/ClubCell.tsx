import Link from "next/link";
import Image from "next/image";
import type { Club } from "@/types/standings";

type Props = {
  club: Club;
  /** Show shortName instead of full name. Used in compact mobile layouts. */
  compact?: boolean;
  href?: string;
};

// Derives a short badge label from the club's shortName:
//   "AFC Leopards" → "AFC"  (leading all-caps word)
//   "Gor Mahia"   → "GM"   (first letter of each word)
//   "Tusker"      → "TUS"  (first 3 chars of single-word name)
function clubInitials(shortName: string): string {
  const words = shortName.trim().split(/\s+/);
  if (words.length === 1) return shortName.slice(0, 3).toUpperCase();
  if (/^[A-Z]{2,4}$/.test(words[0])) return words[0];
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ClubCell({ club, compact = false, href }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {club.logo ? (
        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full" aria-hidden="true">
          <Image
            src={club.logo}
            alt={club.shortName}
            fill
            sizes="28px"
            className="object-contain p-0.5"
          />
        </div>
      ) : (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-black leading-none"
          style={{
            backgroundColor: club.colors.primary,
            color: club.colors.secondary,
          }}
          aria-hidden="true"
        >
          {clubInitials(club.shortName)}
        </div>
      )}

      {href ? (
        <Link
          href={href}
          className="truncate text-sm font-bold hover:text-emerald-700 focus:outline-none focus-visible:underline"
        >
          {compact ? club.shortName : club.name}
        </Link>
      ) : (
        <span className="truncate text-sm font-bold">
          {compact ? club.shortName : club.name}
        </span>
      )}
    </div>
  );
}
