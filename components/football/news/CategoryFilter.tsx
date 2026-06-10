"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/types/news";
import { getCategoryColors } from "@/lib/category.utils";

type Props = {
  categories: Category[];
  currentSlug: string | null;
};

export function CategoryFilter({ categories, currentSlug }: Props) {
  const router = useRouter();

  function navigate(slug: string | null) {
    router.push(slug ? `/news?category=${slug}` : "/news");
  }

  return (
    <div
      role="tablist"
      aria-label="Filter articles by category"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        role="tab"
        aria-selected={currentSlug === null}
        onClick={() => navigate(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
          currentSlug === null
            ? "bg-zinc-950 text-white"
            : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
        }`}
      >
        All
      </button>

      {categories.map((cat) => {
        const isActive = currentSlug === cat.slug;
        const { badge, activeBadge } = getCategoryColors(cat.color);

        return (
          <button
            key={cat.slug}
            role="tab"
            aria-selected={isActive}
            onClick={() => navigate(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              isActive
                ? activeBadge
                : `border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300`
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
