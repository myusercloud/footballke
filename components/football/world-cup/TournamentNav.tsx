"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Overview",  href: "/world-cup" },
  { label: "Fixtures",  href: "/world-cup/fixtures" },
  { label: "Groups",    href: "/world-cup/groups" },
  { label: "Scorers",   href: "/world-cup#scorers" },
  { label: "Players",   href: "/world-cup#players" },
  { label: "News",      href: "/world-cup/news" },
] as const;

export function TournamentNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Tournament navigation"
      className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div className="flex min-w-max gap-1 border-b border-zinc-200 pb-0">
        {LINKS.map(({ label, href }) => {
          const isActive = href.includes("#")
            ? false
            : pathname === href || (href !== "/world-cup" && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${
                isActive
                  ? "border-b-2 border-emerald-600 text-emerald-700"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
