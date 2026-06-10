import type { Article } from "@/types/news";
import { NewsCard } from "./NewsCard";

type Props = {
  articles: Article[];
};

export function RelatedArticles({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="mb-5 text-xl font-black sm:text-2xl"
      >
        Related Articles
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
