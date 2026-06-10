export default function ArticleLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      {/* Header zone */}
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-zinc-200" />
          <div className="h-3 w-2 rounded bg-zinc-200" />
          <div className="h-3 w-12 rounded bg-zinc-200" />
          <div className="h-3 w-2 rounded bg-zinc-200" />
          <div className="h-3 w-24 rounded bg-zinc-200" />
        </div>
        {/* Category badge */}
        <div className="h-5 w-24 rounded-full bg-zinc-200" />
        {/* Title */}
        <div className="space-y-2.5">
          <div className="h-9 rounded bg-zinc-200" />
          <div className="h-9 w-5/6 rounded bg-zinc-200" />
        </div>
        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-5 rounded bg-zinc-200" />
          <div className="h-5 w-4/5 rounded bg-zinc-200" />
        </div>
        {/* Author + date row */}
        <div className="flex items-center justify-between border-y border-zinc-100 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-zinc-200" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded bg-zinc-200" />
              <div className="h-3 w-20 rounded bg-zinc-200" />
            </div>
          </div>
          <div className="h-3.5 w-32 rounded bg-zinc-200" />
        </div>
      </div>

      {/* Cover image */}
      <div className="mx-auto mt-7 max-w-4xl">
        <div className="aspect-[16/7] rounded-sm bg-zinc-200" />
      </div>

      {/* Content blocks */}
      <div className="mx-auto mt-8 max-w-2xl space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 rounded bg-zinc-200" />
            <div className="h-4 w-11/12 rounded bg-zinc-200" />
            <div className="h-4 w-4/5 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
