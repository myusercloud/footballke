"use client";

type Props = { error: Error & { digest?: string }; unstable_retry: () => void };

export default function WorldCupError({ error, unstable_retry }: Props) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-5xl font-black text-zinc-200">!</p>
        <h2 className="mt-4 text-lg font-black text-zinc-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-500">
          We couldn&apos;t load the World Cup hub right now.
          {error.digest && <span className="mt-1 block font-mono text-[10px] text-zinc-400">Error ID: {error.digest}</span>}
        </p>
        <button
          onClick={unstable_retry}
          className="mt-5 rounded-sm bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
