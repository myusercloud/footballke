"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "News", href: "/news" },
  { label: "Fixtures", href: "/#fixtures" },
  { label: "Table", href: "/#table" },
  { label: "Transfers", href: "/news?category=transfer-news" },
  { label: "Opinion", href: "/news?category=opinion" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="flex flex-wrap gap-1 text-sm font-semibold text-zinc-700"
    >
      {NAV_ITEMS.map((item) => {
        // Active for /news and all /news/* routes.
        // Other items are anchors or category filters — active state would
        // require useSearchParams() and a Suspense boundary; out of scope here.
        const isActive =
          item.href === "/news" && pathname.startsWith("/news");

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded px-3 py-1.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 active:bg-emerald-100 sm:px-4 sm:py-2 ${
              isActive
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
