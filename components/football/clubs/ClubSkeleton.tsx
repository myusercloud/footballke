export function ClubSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="h-40 rounded-sm bg-zinc-200" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats block */}
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-24 rounded bg-zinc-200" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-zinc-100" />
              ))}
            </div>
          </div>

          {/* Squad */}
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-20 rounded bg-zinc-200" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-zinc-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-20 rounded bg-zinc-200" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-zinc-100" />
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-20 rounded bg-zinc-200" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-zinc-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="animate-pulse rounded-sm border border-zinc-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-zinc-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-zinc-200" />
          <div className="h-2 w-1/2 rounded bg-zinc-100" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}
