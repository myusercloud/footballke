import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/news";
import { CategoryBadge } from "./CategoryBadge";
import { formatRelativeDate } from "@/lib/news.utils";

type Props = {
  article: Article;
};

export function NewsCard({ article }: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-1">
      {/* Cover image — gradient is the fallback when image is absent */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950">
        {article.coverImage.src && (
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <CategoryBadge category={article.category} />

        <h3 className="mt-2.5 text-base font-black leading-snug tracking-tight sm:text-lg">
          <Link
            href={`/news/${article.slug}`}
            className="focus:outline-none after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 line-clamp-3">
          {article.excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <p className="text-xs font-semibold text-zinc-600">
            {article.author.name}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span>{formatRelativeDate(article.publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
