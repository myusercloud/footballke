import type { ContentBlock } from "@/types/news";

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: ContentBlock[]): number {
  const wordCount = content.reduce<number>((total, block) => {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        return total + block.text.trim().split(/\s+/).length;
      case "rich-paragraph":
        return total + block.children
          .map(n => n.type === "text" || n.type === "link" ? n.text : n.entityName)
          .join(" ").trim().split(/\s+/).length;
      case "list":
        return total + block.items.join(" ").trim().split(/\s+/).length;
      case "image":
      case "horizontal-rule":
        return total;
    }
  }, 0);

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
}
