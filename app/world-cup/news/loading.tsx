export default function WorldCupNewsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-10 rounded-sm bg-zinc-100" />
      <div className="h-8 w-48 rounded-sm bg-zinc-200" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-sm bg-zinc-100" />
        ))}
      </div>
    </main>
  );
}
