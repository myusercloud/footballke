// Skeleton that mirrors the /fixtures page layout: header, filters, featured
// card, and a list of fixture cards. Used by app/fixtures/loading.tsx.
export function FixtureSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div className="h-9 w-40 rounded-sm bg-zinc-200" />
        <div className="h-4 w-20 rounded-sm bg-zinc-200" />
      </div>

      {/* Filter bar */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          {[80, 56, 120, 100].map((w) => (
            <div
              key={w}
              className="h-8 shrink-0 rounded-full bg-zinc-200"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-32 rounded-sm bg-zinc-200" />
          <div className="h-8 w-32 rounded-sm bg-zinc-200" />
          <div className="h-8 w-32 rounded-sm bg-zinc-200" />
        </div>
      </div>

      {/* Featured fixture skeleton */}
      <div className="mb-7 overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-2.5">
          <div className="h-3 w-32 rounded bg-zinc-200" />
          <div className="h-5 w-16 rounded-full bg-zinc-200" />
        </div>
        {/* Body */}
        <div className="px-5 py-6 sm:px-7">
          {/* Date line */}
          <div className="mx-auto h-3 w-40 rounded bg-zinc-200" />
          {/* Teams */}
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-4 rounded-sm bg-zinc-200" />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="h-12 w-24 rounded bg-zinc-200" />
              <div className="h-5 w-14 rounded-full bg-zinc-200" />
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-4 rounded-sm bg-zinc-200" />
                ))}
              </div>
            </div>
          </div>
          {/* Preview text */}
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
            <div className="h-3 rounded bg-zinc-200" />
            <div className="h-3 w-4/5 rounded bg-zinc-200" />
          </div>
        </div>
      </div>

      {/* Fixture card skeletons */}
      <FixtureCardSkeleton />
      <FixtureCardSkeleton />
      <FixtureCardSkeleton />
      <FixtureCardSkeleton />
      <FixtureCardSkeleton />
      <FixtureCardSkeleton />
    </div>
  );
}

function FixtureCardSkeleton() {
  return (
    <div className="mt-3 overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
        <div className="h-3 w-28 rounded bg-zinc-200" />
        <div className="h-5 w-14 rounded-full bg-zinc-200" />
      </div>
      {/* Teams + score */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-zinc-200" />
          <div className="h-4 w-20 rounded bg-zinc-200" />
        </div>
        <div className="h-6 w-14 rounded bg-zinc-200" />
        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="h-4 w-20 rounded bg-zinc-200" />
          <div className="h-8 w-8 rounded-full bg-zinc-200" />
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-zinc-100 px-4 py-1.5">
        <div className="h-3 w-36 rounded bg-zinc-200" />
      </div>
    </div>
  );
}
