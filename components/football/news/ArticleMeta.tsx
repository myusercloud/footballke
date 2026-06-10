import type { Article } from "@/types/news";
import { formatDate } from "@/lib/news.utils";

type Props = {
  article: Article;
};

export function ArticleMeta({ article }: Props) {
  return (
    <div className="space-y-5">
      {/* Tags */}
      {article.tags.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          aria-label="Article tags"
        >
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author card */}
      <div className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white"
            aria-hidden="true"
          >
            {article.author.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-zinc-950">{article.author.name}</p>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {article.author.role}
            </p>
            {article.author.bio && (
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {article.author.bio}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
          <span>
            Published{" "}
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </span>
          {article.updatedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Updated{" "}
                <time dateTime={article.updatedAt}>
                  {formatDate(article.updatedAt)}
                </time>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
