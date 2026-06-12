export function WorldCupSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero */}
      <div className="h-48 rounded-sm bg-zinc-200" />
      {/* Nav */}
      <div className="h-10 rounded-sm bg-zinc-100" />
      {/* Groups grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-sm bg-zinc-100" />
        ))}
      </div>
      {/* Scorers + Players */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-sm bg-zinc-100 lg:col-span-1" />
        <div className="h-64 rounded-sm bg-zinc-100 lg:col-span-2" />
      </div>
    </div>
  );
}

export function FixtureListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 rounded-sm bg-zinc-100" />
      ))}
    </div>
  );
}
