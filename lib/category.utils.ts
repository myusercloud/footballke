import type { CategoryColor } from "@/types/news";

type CategoryColorClasses = {
  badge: string;
  activeBadge: string;
};

// All class strings are complete and static — Tailwind v4 scans these at build time.
const colorMap: Record<CategoryColor, CategoryColorClasses> = {
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    activeBadge: "bg-emerald-800 text-white",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700",
    activeBadge: "bg-amber-600 text-white",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700",
    activeBadge: "bg-blue-700 text-white",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700",
    activeBadge: "bg-purple-700 text-white",
  },
  red: {
    badge: "bg-red-100 text-red-700",
    activeBadge: "bg-red-600 text-white",
  },
  lime: {
    badge: "bg-lime-100 text-lime-700",
    activeBadge: "bg-lime-600 text-white",
  },
  zinc: {
    badge: "bg-zinc-100 text-zinc-600",
    activeBadge: "bg-zinc-700 text-white",
  },
};

export function getCategoryColors(color: CategoryColor): CategoryColorClasses {
  return colorMap[color];
}
