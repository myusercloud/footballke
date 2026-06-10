import Link from "next/link";
import type { Transfer } from "@/types/transfer";
import { TransferBadge } from "./TransferBadge";

type Props = {
  transfer: Transfer;
};

function formatTransferDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

function ClubPill({ name, country }: { name: string; country: string }) {
  const isKenyan = country === "Kenya";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold ${
        isKenyan
          ? "bg-emerald-50 text-emerald-800"
          : "bg-zinc-100 text-zinc-700"
      }`}
    >
      {name}
      {country && country !== "Kenya" && (
        <span className="font-normal text-zinc-400">({country})</span>
      )}
    </span>
  );
}

export function TransferCard({ transfer }: Props) {
  const {
    player,
    fromClub,
    toClub,
    fee,
    status,
    confidence,
    date,
    sourceLabel,
    linkedArticleSlug,
  } = transfer;

  return (
    <article className="flex flex-col gap-3 rounded-sm border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:gap-5">
      {/* Left: badge + date */}
      <div className="flex shrink-0 flex-row items-center gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-1.5">
        <TransferBadge status={status} confidence={confidence} />
        <time
          dateTime={date}
          className="text-[10px] font-semibold text-zinc-400"
        >
          {formatTransferDate(date)}
        </time>
      </div>

      {/* Center: player + movement */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Player info */}
        <div>
          <p className="truncate text-sm font-black text-zinc-950">
            {player.name}
          </p>
          <p className="text-[11px] text-zinc-400">
            {player.position} · {player.nationality} · {player.age} yrs
          </p>
        </div>

        {/* Movement: From → To */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ClubPill name={fromClub.name} country={fromClub.country} />
          <svg
            className="h-3.5 w-3.5 shrink-0 text-zinc-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
              clipRule="evenodd"
            />
          </svg>
          <ClubPill name={toClub.name} country={toClub.country} />
        </div>

        {/* Fee + source */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-semibold text-zinc-600">{fee}</span>
          {sourceLabel && (
            <span className="text-[10px] text-zinc-400">
              via {sourceLabel}
            </span>
          )}
        </div>
      </div>

      {/* Right: link to article */}
      {linkedArticleSlug && (
        <div className="shrink-0 self-start sm:self-center">
          <Link
            href={`/news/${linkedArticleSlug}`}
            className="inline-flex items-center gap-1 rounded-sm border border-zinc-200 px-3 py-1.5 text-[11px] font-bold text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Full story
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </article>
  );
}
