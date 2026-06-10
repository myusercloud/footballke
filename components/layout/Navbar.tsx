import { NavLinks } from "./NavLinks";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Brand — Server Component */}
        <a
          href="/"
          className="flex items-center gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-black text-white"
            aria-hidden="true"
          >
            FK
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700">
              Kenyan Premier League
            </p>
            <span className="text-xl font-black leading-none tracking-tight sm:text-2xl">
              FootballKE
            </span>
          </div>
        </a>

        {/* Nav — Client Component for active-state awareness */}
        <NavLinks />
      </div>
    </header>
  );
}
