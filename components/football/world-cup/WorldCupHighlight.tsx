import Link from "next/link";
import type { Fixture } from "@/types/fixture";
import type { Article } from "@/types/news";
import { eventConfig } from "@/config/events";

type Props = {
  featuredFixture: Fixture | null;
  latestArticle: Article | null;
};

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function WorldCupHighlight({ featuredFixture, latestArticle }: Props) {
  const { label, slug } = eventConfig.worldCup;

  return (
    <section
      className="rounded-sm border border-emerald-200 bg-gradient-to-r from-emerald-950 to-zinc-900 p-5 sm:p-6"
      aria-label={`${label} highlight`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">
            WC
          </span>
          <h2 className="text-sm font-black uppercase tracking-widest text-emerald-300">
            {label}
          </h2>
        </div>
        <Link
          href={`/${slug}`}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Full hub →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Featured fixture */}
        {featuredFixture && (
          <div className="rounded-sm bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">
              {featuredFixture.status === "scheduled" ? "Upcoming" : featuredFixture.status === "fulltime" ? "Result" : "Live"}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 text-white">
              <span className="text-sm font-black">{featuredFixture.homeTeam.abbreviation}</span>
              {featuredFixture.status === "fulltime" && featuredFixture.score ? (
                <span className="text-2xl font-black tabular-nums">
                  {featuredFixture.score.home} – {featuredFixture.score.away}
                </span>
              ) : (
                <span className="text-xs text-zinc-400">
                  {formatKickoff(featuredFixture.kickoff)}
                </span>
              )}
              <span className="text-sm font-black">{featuredFixture.awayTeam.abbreviation}</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">{featuredFixture.venue.name}</p>
          </div>
        )}

        {/* Latest article */}
        {latestArticle && (
          <Link
            href={`/news/${latestArticle.slug}`}
            className="block rounded-sm bg-white/5 p-4 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">Latest Story</p>
            <p className="mt-2 text-sm font-bold leading-snug text-white line-clamp-3">
              {latestArticle.title}
            </p>
          </Link>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 text-center">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 rounded-sm bg-emerald-600 px-6 py-2.5 text-sm font-black text-white transition-colors hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          Go to World Cup Hub →
        </Link>
      </div>
    </section>
  );
}
