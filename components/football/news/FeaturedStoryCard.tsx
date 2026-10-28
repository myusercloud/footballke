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
      className={`group relative flex min-h-[320px] overflow-hidden rounded-sm border border-zinc-200 bg-emerald-950 shadow-sm sm:min-h-[360px] lg:h-full lg:min-h-0 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950">
        {article.coverImage.src && (
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-emerald-950/10" />

      <div className="relative flex flex-1 flex-col justify-end p-5 text-white sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
              aria-hidden="true"
            />
            Featured
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {article.category.name}
          </span>
        </div>

        <h2 className="mt-3 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl xl:text-3xl">
          <Link
            href={`/news/${article.slug}`}
            className="focus:outline-none focus-visible:underline after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
          {article.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300">
          <span className="font-semibold text-zinc-100">{article.author.name}</span>
          <span className="text-zinc-500" aria-hidden="true">·</span>
          <span>{formatRelativeDate(article.publishedAt)}</span>
          <span className="text-zinc-500" aria-hidden="true">·</span>
          <span>{article.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
