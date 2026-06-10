function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
      <div className="aspect-video bg-zinc-200" />
      <div className="p-4 sm:p-5">
        <div className="h-4 w-20 rounded-full bg-zinc-200" />
        <div className="mt-3 space-y-2">
          <div className="h-5 rounded bg-zinc-200" />
          <div className="h-5 w-4/5 rounded bg-zinc-200" />
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="h-3.5 rounded bg-zinc-100" />
          <div className="h-3.5 w-3/4 rounded bg-zinc-100" />
          <div className="h-3.5 w-1/2 rounded bg-zinc-100" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div className="h-3 w-24 rounded bg-zinc-200" />
          <div className="h-3 w-20 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Page header */}
      <div className="flex items-baseline justify-between">
        <div className="h-9 w-48 rounded bg-zinc-200" />
        <div className="h-4 w-20 rounded bg-zinc-200" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 shrink-0 rounded-full bg-zinc-200" />
        ))}
      </div>

      {/* Hero */}
      <div className="min-h-[360px] rounded-sm bg-zinc-200 sm:min-h-[440px]" />

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
