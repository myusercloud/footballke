export default function MatchLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5">
        <div className="h-4 w-10 rounded bg-zinc-200" />
        <div className="h-4 w-2 rounded bg-zinc-200" />
        <div className="h-4 w-14 rounded bg-zinc-200" />
        <div className="h-4 w-2 rounded bg-zinc-200" />
        <div className="h-4 w-28 rounded bg-zinc-200" />
      </div>

      {/* MatchHeader */}
      <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
        {/* Competition / venue strip */}
        <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 sm:px-7">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-44 rounded bg-zinc-200" />
              <div className="h-3 w-36 rounded bg-zinc-200" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3 w-32 rounded bg-zinc-200" />
              <div className="h-3 w-16 rounded bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* Score board body */}
        <div className="px-5 py-8 sm:px-7">
          <div className="flex items-center gap-4">
            {/* Home team */}
            <div className="flex flex-1 flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-zinc-200" />
              <div className="h-4 w-24 rounded bg-zinc-200" />
            </div>

            {/* Score */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="h-12 w-28 rounded bg-zinc-200" />
              <div className="h-6 w-16 rounded-full bg-zinc-200" />
            </div>

            {/* Away team */}
            <div className="flex flex-1 flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-zinc-200" />
              <div className="h-4 w-24 rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview card */}
      <div className="mt-7 space-y-2.5 rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="h-3 w-24 rounded bg-zinc-200" />
        <div className="mt-4 space-y-2">
          <div className="h-4 rounded bg-zinc-200" />
          <div className="h-4 w-11/12 rounded bg-zinc-200" />
          <div className="h-4 w-4/5 rounded bg-zinc-200" />
          <div className="h-4 w-3/5 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
