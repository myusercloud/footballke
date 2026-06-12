"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics/analytics";
import { events } from "@/lib/analytics/events";

const NAV_ITEMS = [
  { label: "News",      href: "/news",                    prefix: "/news",      category: null        },
  { label: "Fixtures",  href: "/fixtures",                prefix: "/fixtures",  category: null        },
  { label: "Table",     href: "/standings",               prefix: "/standings", category: null        },
  { label: "Clubs",     href: "/clubs",                   prefix: "/clubs",     category: null        },
  { label: "Transfers", href: "/transfers",               prefix: "/transfers", category: null        },
  { label: "Opinion",   href: "/news?category=opinion",   prefix: "/news",      category: "opinion"   },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

// Category slugs that have their own dedicated nav items (used to prevent
// "News" from lighting up when a category nav item is active).
const CATEGORY_NAV_SLUGS = NAV_ITEMS
  .filter((item) => item.category !== null)
  .map((item) => item.category as string);

export function NavLinks() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  function isActive(item: NavItem): boolean {
    // Category-scoped nav items (e.g. Opinion)
    if (item.category !== null) {
      return pathname === "/news" && activeCategory === item.category;
    }

    if (!pathname.startsWith(item.prefix)) return false;

    // "News" (prefix="/news", no category): active for /news/* unless a
    // category-specific nav item is active at the same path.
    if (item.prefix === "/news") {
      return !CATEGORY_NAV_SLUGS.includes(activeCategory ?? "");
    }

    return true;
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="flex flex-wrap gap-1 text-sm font-semibold text-zinc-700"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() =>
              track(events.navClick({ label: item.label, destination: item.href }))
            }
            className={`rounded px-3 py-1.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 active:bg-emerald-100 sm:px-4 sm:py-2 ${
              active
                ? "bg-emerald-50 font-black text-emerald-800"
                : "hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
