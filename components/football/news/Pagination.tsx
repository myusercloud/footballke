import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  categorySlug?: string;
};

function buildUrl(page: number, categorySlug?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (categorySlug) params.set("category", categorySlug);
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("…");

  pages.push(total);

  return pages;
}

const baseBtn =
  "flex h-9 w-9 items-center justify-center rounded-sm border text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600";

export function Pagination({ page, totalPages, categorySlug }: Props) {
  const pages = getPageNumbers(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="mt-2 flex justify-center gap-1">
      {hasPrev ? (
        <Link
          href={buildUrl(page - 1, categorySlug)}
          aria-label="Previous page"
          className={`${baseBtn} border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-700`}
        >
          ←
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Previous page"
          className={`${baseBtn} pointer-events-none border-zinc-100 text-zinc-300`}
        >
          ←
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-zinc-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p, categorySlug)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${baseBtn} ${
              p === page
                ? "border-emerald-800 bg-emerald-800 text-white"
                : "border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {hasNext ? (
        <Link
          href={buildUrl(page + 1, categorySlug)}
          aria-label="Next page"
          className={`${baseBtn} border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-700`}
        >
          →
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label="Next page"
          className={`${baseBtn} pointer-events-none border-zinc-100 text-zinc-300`}
        >
          →
        </span>
      )}
    </nav>
  );
}
