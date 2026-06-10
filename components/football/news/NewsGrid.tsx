import type { Article } from "@/types/news";
import { NewsCard } from "./NewsCard";

type Props = {
  articles: Article[];
};

export function NewsGrid({ articles }: Props) {
  return (
    <section
      aria-label="News articles"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </section>
  );
}
