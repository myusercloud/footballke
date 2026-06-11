"use client";

import { track } from "@/lib/analytics/analytics";
import { events } from "@/lib/analytics/events";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-black text-white"
                aria-hidden="true"
              >
                FK
              </div>
              <p className="text-base font-black">FootballKE</p>
            </div>
            <p className="mt-2.5 max-w-sm text-sm leading-6 text-zinc-500">
              Your home for Kenyan Premier League coverage — from kickoff
              to final whistle. Match reports, standings, transfers, and
              opinion every matchday.
            </p>
            <div className="mt-4 flex gap-3">
              {["Twitter", "Facebook", "Instagram"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  onClick={() =>
                    track(events.footerLinkClick({ label: platform, destination: "#", type: "social" }))
                  }
                  className="rounded-sm border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Sections
            </p>
            <nav
              aria-label="Footer sections navigation"
              className="flex flex-col gap-2 text-sm font-semibold text-zinc-600"
            >
              {["News", "Fixtures", "Table", "Transfers", "Opinion"].map(
                (item) => (
                  <a
                    key={item}
                    className="w-fit transition-colors hover:text-emerald-700 focus:text-emerald-700 focus:outline-none"
                    href={`#${item.toLowerCase()}`}
                  >
                    {item}
                  </a>
                )
              )}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Contact
            </p>
            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <a
                href="mailto:ads@footballke.com"
                onClick={() =>
                  track(events.footerLinkClick({ label: "ads@footballke.com", destination: "mailto:ads@footballke.com", type: "contact" }))
                }
                className="font-semibold hover:text-emerald-700 focus:outline-none"
              >
                ads@footballke.com
              </a>
              <a
                href="mailto:editor@footballke.com"
                onClick={() =>
                  track(events.footerLinkClick({ label: "editor@footballke.com", destination: "mailto:editor@footballke.com", type: "contact" }))
                }
                className="font-semibold hover:text-emerald-700 focus:outline-none"
              >
                editor@footballke.com
              </a>
              <p className="mt-1 text-xs text-zinc-400">Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} FootballKE. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-semibold text-zinc-400">
            <a href="#" className="hover:text-zinc-600 focus:outline-none">Privacy</a>
            <a href="#" className="hover:text-zinc-600 focus:outline-none">Terms</a>
            <a href="#" className="hover:text-zinc-600 focus:outline-none">Cookie policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
