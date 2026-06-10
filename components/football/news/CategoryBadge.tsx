import type { Category } from "@/types/news";
import { getCategoryColors } from "@/lib/category.utils";

type Props = {
  category: Category;
};

export function CategoryBadge({ category }: Props) {
  const { badge } = getCategoryColors(category.color);
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] ${badge}`}
    >
      {category.name}
    </span>
  );
}
