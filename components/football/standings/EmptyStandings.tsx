type Props = {
  message?: string;
};

export function EmptyStandings({
  message = "No standings available for the selected competition and season.",
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
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <p className="max-w-xs text-sm text-zinc-400">{message}</p>
    </div>
  );
}
