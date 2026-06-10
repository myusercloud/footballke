import Link from "next/link";

export default function MatchNotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V12Zm0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-lg font-black text-zinc-900">
          Match not found
        </h1>

        <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
          This fixture doesn&apos;t exist or may have been removed. Browse all
          upcoming and recent KPL matches below.
        </p>

        <Link
          href="/fixtures"
          className="mt-6 rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View all fixtures
        </Link>
      </div>
    </main>
  );
}
