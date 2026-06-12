import Link from "next/link";
import type { Club } from "@/types/club";

type Props = { club: Club };

const FORM_COLORS: Record<string, string> = {
  W: "bg-emerald-600 text-white",
  D: "bg-amber-400 text-zinc-900",
  L: "bg-red-500 text-white",
};

export function ClubCard({ club }: Props) {
  const { stats } = club;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-1">
      {/* Color band using club primary */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: club.colors.primary }}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Logo placeholder + name */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
            style={{ backgroundColor: club.colors.primary }}
            aria-hidden="true"
          >
            {club.abbreviation}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black leading-tight tracking-tight">
              <Link
                href={`/clubs/${club.slug}`}
                className="focus:outline-none after:absolute after:inset-0"
              >
                {club.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              {club.city} · Est. {club.founded}
            </p>
          </div>

          {/* Position badge */}
          <span
            className={`ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
              stats.position === 1
                ? "bg-amber-400 text-zinc-900"
                : stats.position <= 4
                  ? "bg-emerald-600 text-white"
                  : stats.position >= 14
                    ? "bg-red-500 text-white"
                    : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {stats.position}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-4 divide-x divide-zinc-100 rounded-sm bg-zinc-50 text-center">
          {[
            { label: "P", value: stats.played },
            { label: "W", value: stats.won },
            { label: "GD", value: stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference },
            { label: "Pts", value: stats.points },
          ].map(({ label, value }) => (
            <div key={label} className="py-2">
              <p className="text-[10px] text-zinc-400">{label}</p>
              <p className="text-sm font-black text-zinc-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Form strip */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400">Form</span>
          {stats.form.map((result, i) => (
            <span
              key={i}
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${FORM_COLORS[result] ?? "bg-zinc-300 text-zinc-700"}`}
            >
              {result}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
