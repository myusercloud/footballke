function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-zinc-200 ${className}`} />;
}

function DesktopRow() {
  return (
    <tr className="border-b border-zinc-100">
      {/* # */}
      <td className="py-3 pl-4 pr-2 w-10">
        <Pulse className="h-5 w-5" />
      </td>
      {/* Club */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <Pulse className="h-7 w-7 rounded-full" />
          <Pulse className="h-4 w-32" />
        </div>
      </td>
      {/* P W D L */}
      {[...Array(4)].map((_, i) => (
        <td key={i} className="py-3 px-2 text-center">
          <Pulse className="mx-auto h-4 w-5" />
        </td>
      ))}
      {/* GF GA — hidden until lg */}
      {[...Array(2)].map((_, i) => (
        <td key={i} className="hidden lg:table-cell py-3 px-2 text-center">
          <Pulse className="mx-auto h-4 w-5" />
        </td>
      ))}
      {/* GD */}
      <td className="py-3 px-2 text-center">
        <Pulse className="mx-auto h-4 w-6" />
      </td>
      {/* Pts */}
      <td className="py-3 px-2 text-center">
        <Pulse className="mx-auto h-4 w-6" />
      </td>
      {/* Form — hidden until lg */}
      <td className="hidden lg:table-cell py-3 pl-2 pr-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Pulse key={i} className="h-5 w-5" />
          ))}
        </div>
      </td>
    </tr>
  );
}

function MobileCard() {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
      <Pulse className="h-6 w-6" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Pulse className="h-7 w-7 rounded-full shrink-0" />
        <Pulse className="h-4 w-28" />
      </div>
      <div className="flex gap-3 shrink-0">
        <Pulse className="h-4 w-6" />
        <Pulse className="h-4 w-6" />
      </div>
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading standings">
      {/* Filter bar skeleton */}
      <div className="flex gap-3 px-4 py-4 md:px-6">
        <Pulse className="h-9 w-40 rounded-md" />
        <Pulse className="h-9 w-32 rounded-md" />
        <Pulse className="h-9 w-36 rounded-md" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-400">
              <th className="pb-2 pl-4 pr-2 w-10">#</th>
              <th className="pb-2 pr-4">Club</th>
              {["P", "W", "D", "L"].map((h) => (
                <th key={h} className="pb-2 px-2 text-center w-9">{h}</th>
              ))}
              {["GF", "GA"].map((h) => (
                <th key={h} className="hidden lg:table-cell pb-2 px-2 text-center w-9">{h}</th>
              ))}
              <th className="pb-2 px-2 text-center w-10">GD</th>
              <th className="pb-2 px-2 text-center w-10">Pts</th>
              <th className="hidden lg:table-cell pb-2 pl-2 pr-4 w-32">Form</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(18)].map((_, i) => (
              <DesktopRow key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {[...Array(18)].map((_, i) => (
          <MobileCard key={i} />
        ))}
      </div>

      {/* Legend skeleton */}
      <div className="flex gap-4 px-4 py-3 md:px-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Pulse className="h-2.5 w-2.5" />
            <Pulse className="h-3 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}
