import type { Metadata } from "next";
import {
  getTransfers,
  getTransferWindows,
  getTransferKplClubs,
} from "@/lib/transfers.cache";
import { TransferCard } from "@/components/football/transfers/TransferCard";
import { TransferFilters } from "@/components/football/transfers/TransferFilters";
import { EmptyTransfers } from "@/components/football/transfers/EmptyTransfers";
import type { TransferStatus } from "@/types/transfer";
import { parseTransferStatus, parseTransferWindow } from "@/lib/transfers.utils";
import { Suspense } from "react";
import { TransferSkeleton } from "@/components/football/transfers/TransferSkeleton";

// ── Types ─────────────────────────────────────────────────────────────────────

type SearchParams = {
  status?: string;
  window?: string;
  club?: string;
  page?: string;
};

type PageProps = { searchParams: Promise<SearchParams> };

const SECTION_ORDER: (TransferStatus)[] = [
  "confirmed", "loan", "rumour", "exit",
];

const SECTION_LABELS: Record<TransferStatus, string> = {
  confirmed: "Confirmed Signings",
  loan:      "Loans",
  rumour:    "Rumours",
  exit:      "Exits",
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { status, window } = await searchParams;

  const statusLabel =
    status && status !== "all"
      ? status.charAt(0).toUpperCase() + status.slice(1) + "s"
      : null;

  const title = statusLabel
    ? `${statusLabel} — KPL Transfers`
    : "KPL Transfers";

  const description =
    "Kenyan Premier League transfer news, confirmed signings, loan moves, and the latest rumours from the summer window.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TransfersPage({ searchParams }: PageProps) {
  const { status, window, club, page: pageParam } = await searchParams;

  const activeStatus = parseTransferStatus(status);
  const activeWindow = parseTransferWindow(window);
  const activeClub   = club ?? "";
  const page         = Math.max(1, Number(pageParam) || 1);

  const [{ transfers, total, totalPages }, windows, clubs] =
    await Promise.all([
      getTransfers({
        status: activeStatus,
        window: activeWindow === "all" ? undefined : activeWindow,
        clubSlug: activeClub || undefined,
        page,
        pageSize: 20,
      }),
      getTransferWindows(),
      getTransferKplClubs(),
    ]);

  // Curated mode (no filters): group by status in display order
  const isFiltered =
    activeStatus !== "all" || activeWindow !== "all" || activeClub !== "";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Transfers
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          KPL transfer news · Summer 2026 window
        </p>
      </div>

      {/* Filters — wrapped in Suspense because TransferFilters uses useSearchParams */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md bg-zinc-100" />}>
          <TransferFilters
            windows={windows}
            clubs={clubs}
            activeStatus={activeStatus}
            activeWindow={activeWindow}
            activeClub={activeClub}
          />
        </Suspense>
      </div>

      {/* Content */}
      {transfers.length === 0 ? (
        <EmptyTransfers />
      ) : isFiltered ? (
        /* Filtered: flat list */
        <div className="space-y-3">
          {total > 0 && (
            <p className="mb-4 text-sm text-zinc-500">
              {total} transfer{total !== 1 ? "s" : ""}
            </p>
          )}
          {transfers.map((t) => (
            <TransferCard key={t.id} transfer={t} />
          ))}
        </div>
      ) : (
        /* Curated: grouped by status */
        <div className="space-y-10">
          {SECTION_ORDER.map((s) => {
            const group = transfers.filter((t) => t.status === s);
            if (group.length === 0) return null;
            return (
              <section key={s} aria-labelledby={`section-${s}`}>
                <h2
                  id={`section-${s}`}
                  className="mb-3 text-lg font-black text-zinc-900 sm:text-xl"
                >
                  {SECTION_LABELS[s]}
                </h2>
                <div className="space-y-3">
                  {group.map((t) => (
                    <TransferCard key={t.id} transfer={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
