type Props = {
  message?: string;
};

export function EmptyTransfers({
  message = "No transfers found for the selected filters.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
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
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
      <p className="max-w-xs text-sm text-zinc-400">{message}</p>
    </div>
  );
}
