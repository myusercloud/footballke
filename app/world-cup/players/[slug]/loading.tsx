export default function TournamentPlayerLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="h-10 rounded-sm bg-zinc-100" />
      <div className="h-36 rounded-sm bg-zinc-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-sm bg-zinc-100" />
        <div className="h-64 rounded-sm bg-zinc-100 lg:col-span-2" />
      </div>
    </main>
  );
}
