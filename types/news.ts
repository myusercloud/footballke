// ── Primitives ────────────────────────────────────────────────────────────────

export type NewsImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
};

export type Author = {
  id: string;
  name: string;
  role: string;
  avatar?: NewsImage;
  bio?: string;
};

export type CategoryColor =
  | "emerald"
  | "amber"
  | "blue"
  | "purple"
  | "red"
  | "lime"
  | "zinc";

export type Category = {
  id: string;
  name: string;
  slug: string;
  color: CategoryColor;
};

// ── Structured content (portable-text style) ─────────────────────────────────
// Discriminated union keeps the renderer type-safe and CMS-portable.
// Raw HTML strings are explicitly avoided — rendering is a component concern.

// Inline nodes used inside rich paragraphs that contain @mentions
export type InlineText = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
};

export type InlineMention = {
  type: "mention";
  entityType: "player" | "club";
  entitySlug: string;
  entityName: string;
  href: string;
};

export type InlineLink = {
  type: "link";
  href: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
};

export type InlineNode = InlineText | InlineMention | InlineLink;

// Plain paragraph — used by JSON provider and articles with no mentions
export type ContentBlockParagraph = {
  type: "paragraph";
  text: string;
};

// Rich paragraph — used when the paragraph contains at least one @mention
export type ContentBlockRichParagraph = {
  type: "rich-paragraph";
  children: InlineNode[];
};

export type ContentBlockHeading = {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
};

export type ContentBlockImage = {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type ContentBlockQuote = {
  type: "quote";
  text: string;
  attribution?: string;
};

export type ContentBlockList = {
  type: "list";
  ordered: boolean;
  items: string[];
};

export type ContentBlockHorizontalRule = {
  type: "horizontal-rule";
};

export type ContentBlock =
  | ContentBlockParagraph
  | ContentBlockRichParagraph
  | ContentBlockHeading
  | ContentBlockImage
  | ContentBlockQuote
  | ContentBlockList
  | ContentBlockHorizontalRule;

// ── Core entity ───────────────────────────────────────────────────────────────

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  coverImage: NewsImage;
  author: Author;
  category: Category;
  tags: string[];
  publishedAt: string; // ISO 8601
  updatedAt?: string;
  readingTime: number; // minutes, derived by service — not stored in JSON
  featured: boolean;
  relatedSlugs: string[];
};

// ── Service contracts ─────────────────────────────────────────────────────────

export type GetNewsParams = {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  featured?: boolean;
};

export type NewsResponse = {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export interface INewsService {
  getNews(params?: GetNewsParams): Promise<NewsResponse>;
  getNewsBySlug(slug: string): Promise<Article | null>;
  getRelatedNews(
    slug: string,
    categorySlug: string,
    limit?: number
  ): Promise<Article[]>;
  getCategories(): Promise<Category[]>;
}
