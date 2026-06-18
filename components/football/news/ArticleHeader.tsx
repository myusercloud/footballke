import Image from "next/image";
import type { Article } from "@/types/news";
import { CategoryBadge } from "./CategoryBadge";
import { Breadcrumb } from "./Breadcrumb";
import { formatDate } from "@/lib/news.utils";

type Props = {
  article: Article;
};

export function ArticleHeader({ article }: Props) {
  return (
    <header>
      {/* ── Narrow zone: breadcrumb → title → meta ─────────────────────── */}
      <div className="mx-auto max-w-2xl">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            {
              label: article.category.name,
              href: `/news?category=${article.category.slug}`,
            },
            { label: article.title },
          ]}
        />

        <div className="mt-4">
          <CategoryBadge category={article.category} />
        </div>

        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-8 text-zinc-600">{article.excerpt}</p>

        {/* Author + date row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-zinc-200 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white"
              aria-hidden="true"
            >
              {article.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-zinc-900">
                {article.author.name}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {article.author.role}
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </div>

      {/* ── Wide zone: cover image ──────────────────────────────────────── */}
      <div className="mx-auto mt-7 max-w-4xl">
        <div className="relative aspect-[16/7] overflow-hidden rounded-sm bg-gradient-to-br from-emerald-800 to-emerald-950">
          {article.coverImage.src && (
            <Image
              src={article.coverImage.src}
              alt={article.coverImage.alt}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 896px"
              className="object-cover"
            />
          )}
        </div>
      </div>
    </header>
  );
}
