import Link from "next/link";

type Props = {
  categoryName?: string;
};

export function EmptyNewsState({ categoryName }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100"
        aria-hidden="true"
      >
        <svg
          className="h-6 w-6 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-black text-zinc-900">
        {categoryName ? `No ${categoryName} articles yet` : "No articles found"}
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
        {categoryName
          ? `There are no articles in this category right now. Check back soon or browse all stories.`
          : "We couldn't find any articles. Check back later for the latest KPL news."}
      </p>

      {categoryName && (
        <Link
          href="/news"
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View all news
        </Link>
      )}
    </div>
  );
}
