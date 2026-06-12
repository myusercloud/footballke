export function PlayerSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="h-40 rounded-sm bg-zinc-200" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats */}
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-24 rounded bg-zinc-200" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-zinc-100" />
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-16 rounded bg-zinc-200" />
            <div className="space-y-2">
              <div className="h-3 rounded bg-zinc-100" />
              <div className="h-3 w-5/6 rounded bg-zinc-100" />
              <div className="h-3 w-4/6 rounded bg-zinc-100" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile */}
          <div className="rounded-sm border border-zinc-100 bg-white p-5">
            <div className="mb-4 h-4 w-16 rounded bg-zinc-200" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-1/3 rounded bg-zinc-200" />
                  <div className="h-3 w-1/3 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>

          {/* News */}
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

export function PlayerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-sm border border-zinc-100 bg-white">
      <div className="h-1 rounded-t-sm bg-zinc-200" />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-full bg-zinc-200" />
          <div className="h-3 w-6 rounded bg-zinc-100" />
        </div>
        <div className="mt-2 h-3 w-3/4 rounded bg-zinc-200" />
        <div className="mt-1 h-2 w-1/2 rounded bg-zinc-100" />
        <div className="mt-3 flex gap-4 border-t border-zinc-50 pt-3">
          <div className="h-8 w-8 rounded bg-zinc-100" />
          <div className="h-8 w-8 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
