"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ArticleError({ error, unstable_retry }: Props) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
          aria-hidden="true"
        >
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-black text-zinc-900">
          Couldn&apos;t load article
        </h2>

        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          Something went wrong while loading this article.
          {error.digest && (
            <span className="mt-1 block font-mono text-[10px] text-zinc-400">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={unstable_retry}
            className="rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/news"
            className="rounded-sm border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Back to news
          </Link>
        </div>
      </div>
    </main>
  );
}
