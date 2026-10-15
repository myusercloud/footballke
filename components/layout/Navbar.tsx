import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "./NavLinks";

// Shown while NavLinks suspends (e.g. during soft navigation).
// Matches the nav layout so there is no layout shift.
function NavFallback() {
  return (
    <nav
      aria-label="Primary navigation"
      className="flex flex-wrap gap-1 text-sm font-semibold text-zinc-700"
    >
      {["News", "Fixtures", "Table", "Clubs", "Players", "Transfers", "Opinion"].map((label) => (
        <span
          key={label}
          className="rounded px-3 py-1.5 text-zinc-400 sm:px-4 sm:py-2"
        >
          {label}
        </span>
      ))}
    </nav>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="FootballKE — home"
          className="flex items-center gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700">
              Kenyan Premier League
            </p>
            <Image
              src="/footballke-wordmark.png"
              alt="FootballKE"
              width={210}
              height={34}
              priority
              className="mt-0.5 h-auto w-[160px] sm:w-[210px]"
            />
          </div>
        </Link>

        {/* Nav — useSearchParams requires Suspense */}
        <Suspense fallback={<NavFallback />}>
          <NavLinks />
        </Suspense>
      </div>
    </header>
  );
}
