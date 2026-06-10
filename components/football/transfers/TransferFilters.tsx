"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TransferClub, TransferStatus, TransferWindow } from "@/types/transfer";

type Props = {
  windows: TransferWindow[];
  clubs: TransferClub[];
  activeStatus: TransferStatus | "all";
  activeWindow: TransferWindow | "all";
  activeClub: string;
};

const STATUS_TABS: { value: TransferStatus | "all"; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "confirmed", label: "Confirmed" },
  { value: "loan",      label: "Loans"     },
  { value: "rumour",    label: "Rumours"   },
  { value: "exit",      label: "Exits"     },
];

const WINDOW_LABELS: Record<TransferWindow, string> = {
  "summer-2026": "Summer 2026",
  "winter-2026": "Winter 2026",
  "summer-2025": "Summer 2025",
};

// Static tab color maps — Tailwind v4 safe
const TAB_ACTIVE: Record<TransferStatus | "all", string> = {
  all:       "bg-zinc-950 text-white",
  confirmed: "bg-emerald-800 text-white",
  loan:      "bg-blue-700 text-white",
  rumour:    "bg-amber-600 text-white",
  exit:      "bg-zinc-600 text-white",
};

export function TransferFilters({
  windows,
  clubs,
  activeStatus,
  activeWindow,
  activeClub,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter by transfer status"
        className="flex flex-wrap gap-2"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => navigate({ status: tab.value })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                isActive
                  ? TAB_ACTIVE[tab.value]
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Secondary filters: window + club */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Window */}
        {windows.length > 1 && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="transfer-window"
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
            >
              Window
            </label>
            <select
              id="transfer-window"
              value={activeWindow}
              onChange={(e) => navigate({ window: e.target.value })}
              className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <option value="all">All windows</option>
              {windows.map((w) => (
                <option key={w} value={w}>
                  {WINDOW_LABELS[w] ?? w}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Club */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="transfer-club"
            className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
          >
            Club
          </label>
          <select
            id="transfer-club"
            value={activeClub}
            onChange={(e) => navigate({ club: e.target.value })}
            className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="">All clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
