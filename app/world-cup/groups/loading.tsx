export default function WorldCupGroupsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-10 rounded-sm bg-zinc-100" />
      <div className="h-8 w-32 rounded-sm bg-zinc-200" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-52 rounded-sm bg-zinc-100" />
        ))}
      </div>
    </main>
  );
}
