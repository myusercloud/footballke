import Link from "next/link";

export default function TeamNotFound() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-black text-zinc-200">404</p>
        <h1 className="mt-4 text-xl font-black text-zinc-900">Team not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This team isn&apos;t in our World Cup database.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/world-cup/groups"
            className="rounded-sm bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            View all groups
          </Link>
          <Link
            href="/world-cup"
            className="rounded-sm border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            World Cup hub
          </Link>
        </div>
      </div>
    </main>
  );
}
