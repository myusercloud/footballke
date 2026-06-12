import type { Club } from "@/types/club";

type Props = { club: Club };

const FORM_COLORS: Record<string, string> = {
  W: "bg-emerald-500 text-white",
  D: "bg-amber-400 text-zinc-900",
  L: "bg-red-500 text-white",
};

export function ClubHeader({ club }: Props) {
  const { stats } = club;

  return (
    <header
      className="relative overflow-hidden rounded-sm"
      style={{ backgroundColor: club.colors.primary }}
    >
      {/* Secondary color accent bar */}
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ backgroundColor: club.colors.secondary }}
        aria-hidden="true"
      />

      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Logo placeholder */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 text-2xl font-black text-white"
            style={{ backgroundColor: `${club.colors.secondary}33` }}
            aria-hidden="true"
          >
            {club.abbreviation}
          </div>

          {/* Identity */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {club.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              <span>{club.city}, {club.country}</span>
              <span aria-hidden="true">·</span>
              <span>Est. {club.founded}</span>
              <span aria-hidden="true">·</span>
              <span>{club.venue.name}</span>
            </div>
          </div>

          {/* Position + Form */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            <div className="text-right">
              <p className="text-xs text-white/60">League Position</p>
              <p className="text-4xl font-black text-white">
                #{stats.position}
              </p>
            </div>
            <div className="flex gap-1">
              {stats.form.map((result, i) => (
                <span
                  key={i}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${FORM_COLORS[result] ?? "bg-white/20 text-white"}`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
