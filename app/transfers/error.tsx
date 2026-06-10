"use client";

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function TransfersError({ error, unstable_retry }: Props) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-zinc-300"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-zinc-800">Transfers unavailable</h2>
        <p className="max-w-xs text-sm text-zinc-400">
          {error.message || "Something went wrong loading the transfer feed."}
        </p>
      </div>
      <button
        onClick={unstable_retry}
        className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        Try again
      </button>
    </main>
  );
}
