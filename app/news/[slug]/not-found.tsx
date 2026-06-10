import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <p
          className="text-7xl font-black text-zinc-200 sm:text-8xl"
          aria-hidden="true"
        >
          404
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900">
          Article not found
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
          This article may have been removed or the URL might be incorrect.
          Head back to the news section for the latest KPL coverage.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/news"
            className="rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Back to news
          </Link>
          <Link
            href="/"
            className="rounded-sm border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Go to home
          </Link>
        </div>
      </div>
    </main>
  );
}
