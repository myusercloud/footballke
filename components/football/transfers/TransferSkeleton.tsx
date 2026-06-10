function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-200 ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:gap-5">
      {/* Badge + date */}
      <div className="flex shrink-0 flex-row items-center gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-1.5">
        <Pulse className="h-5 w-20 rounded-full" />
        <Pulse className="h-3 w-14" />
      </div>
      {/* Player + movement */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="space-y-1">
          <Pulse className="h-4 w-36" />
          <Pulse className="h-3 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Pulse className="h-6 w-28 rounded-sm" />
          <Pulse className="h-3 w-3" />
          <Pulse className="h-6 w-28 rounded-sm" />
        </div>
        <Pulse className="h-3 w-20" />
      </div>
    </div>
  );
}

export function TransferSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading transfers" className="space-y-5">
      {/* Filter skeleton */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Pulse key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex gap-3">
          <Pulse className="h-9 w-36 rounded-md" />
          <Pulse className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
