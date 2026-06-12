import Link from "next/link";
import type { Article } from "@/types/news";

type Props = { articles: Article[]; playerName: string };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });
}

export function PlayerRelatedNews({ articles, playerName }: Props) {
  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label={`News about ${playerName}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Latest News</h2>
        <Link
          href="/news"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          All news →
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="px-5 py-6 text-sm text-zinc-400">
          No recent articles for {playerName}.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-50">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/news/${article.slug}`}
                className="block px-5 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
              >
                <p className="text-sm font-bold leading-snug text-zinc-900 line-clamp-2">
                  {article.title}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {formatDate(article.publishedAt)} · {article.readingTime} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
