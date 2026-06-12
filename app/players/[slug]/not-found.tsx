import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-5xl font-black text-zinc-200">404</p>
        <h1 className="mt-4 text-xl font-black text-zinc-900">Player not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          That player doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/clubs"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          ← All clubs
        </Link>
      </div>
    </main>
  );
}
