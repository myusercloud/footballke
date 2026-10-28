import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { formatRelativeDate } from "@/lib/news.utils";

type Props = {
  article: Article;
  className?: string;
};

export function FeaturedStoryCard({ article, className = "" }: Props) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-1 ${className}`}
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 sm:h-60 lg:h-56">
        {article.coverImage.src && (
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-zinc-950/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />

        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
              aria-hidden="true"
            />
            Featured
          </span>
          <span className="rounded-full bg-zinc-950/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {article.category.name}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-xl font-black leading-tight tracking-tight text-zinc-950 transition-colors group-hover:text-emerald-900 sm:text-2xl xl:text-3xl">
          <Link
            href={`/news/${article.slug}`}
            className="focus:outline-none focus-visible:underline after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7">
          {article.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:text-sm">
          <span className="font-semibold text-zinc-700">{article.author.name}</span>
          <span className="text-zinc-300" aria-hidden="true">·</span>
          <span>{formatRelativeDate(article.publishedAt)}</span>
          <span className="text-zinc-300" aria-hidden="true">·</span>
          <span>{article.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
