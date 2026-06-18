import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { CategoryBadge } from "./CategoryBadge";
import { formatRelativeDate } from "@/lib/news.utils";

type Props = {
  article: Article;
};

export function HeroArticle({ article }: Props) {
  return (
    <article className="group relative min-h-[360px] overflow-hidden rounded-sm border border-zinc-200 shadow-sm sm:min-h-[440px]">
      {/* Background — emerald gradient is the fallback when image is absent */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950">
        {article.coverImage.src && (
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.01]"
          />
        )}
      </div>

      {/* Gradient overlay — ensures text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {article.featured && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
                aria-hidden="true"
              />
              Featured
            </span>
          )}
          <CategoryBadge category={article.category} />
        </div>

        {/* Title */}
        <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl xl:text-4xl">
          <Link
            href={`/news/${article.slug}`}
            className="focus:outline-none focus-visible:underline after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-300 line-clamp-2 sm:text-base">
          {article.excerpt}
        </p>

        {/* Author meta */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-black text-white backdrop-blur-sm"
            aria-hidden="true"
          >
            {article.author.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-zinc-200">
            {article.author.name}
          </span>
          <span className="text-zinc-500" aria-hidden="true">
            ·
          </span>
          <span className="text-sm text-zinc-400">
            {formatRelativeDate(article.publishedAt)}
          </span>
          <span className="text-zinc-500" aria-hidden="true">
            ·
          </span>
          <span className="text-sm text-zinc-400">
            {article.readingTime} min read
          </span>
        </div>
      </div>
    </article>
  );
}
