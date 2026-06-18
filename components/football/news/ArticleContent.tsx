import Image from "next/image";
import Link from "next/link";
import type { ContentBlock, InlineNode } from "@/types/news";

type Props = {
  blocks: ContentBlock[];
};

function applyTextMarks(
  text: string,
  bold?: boolean,
  italic?: boolean,
): React.ReactNode {
  let el: React.ReactNode = text;
  if (bold && italic) el = <strong><em>{text}</em></strong>;
  else if (bold)   el = <strong>{text}</strong>;
  else if (italic) el = <em>{text}</em>;
  return el;
}

function renderInline(node: InlineNode, i: number): React.ReactNode {
  if (node.type === "mention") {
    const href = node.entityType === "club"
      ? `/clubs/${node.entitySlug}`
      : `/players/${node.entitySlug}`;
    return (
      <Link
        key={i}
        href={href}
        className="font-bold text-zinc-900 border-b-2 border-emerald-700 hover:border-emerald-400 transition"
      >
        {node.entityName}
      </Link>
    );
  }

  if (node.type === "link") {
    const isExternal = node.href.startsWith("http");
    return (
      <Link
        key={i}
        href={node.href}
        className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900 transition-colors"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {applyTextMarks(node.text, node.bold, node.italic)}
      </Link>
    );
  }

  // Plain text with optional formatting
  let el: React.ReactNode = applyTextMarks(node.text, node.bold, node.italic);
  if (node.underline) el = <u key={`u-${i}`}>{el}</u>;
  if (node.strike)    el = <s key={`s-${i}`}>{el}</s>;
  return <span key={i}>{el}</span>;
}

function renderBlock(block: ContentBlock, index: number) {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className="text-base leading-8 text-zinc-700">
          {block.text}
        </p>
      );

    case "rich-paragraph":
      return (
        <p key={key} className="text-base leading-8 text-zinc-700">
          {block.children.map((node, i) => renderInline(node, i))}
        </p>
      );

    case "heading":
      if (block.level === 2) {
        return (
          <h2
            key={key}
            className="mt-8 mb-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl"
          >
            {block.text}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3
            key={key}
            className="mt-6 mb-0.5 text-lg font-black tracking-tight text-zinc-950"
          >
            {block.text}
          </h3>
        );
      }
      return (
        <h4
          key={key}
          className="mt-5 mb-0.5 text-base font-black text-zinc-950"
        >
          {block.text}
        </h4>
      );

    case "image":
      return (
        <figure key={key} className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-sm bg-gradient-to-br from-zinc-200 to-zinc-300">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 896px) 100vw, 672px"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 text-center text-xs text-zinc-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="my-6 border-l-4 border-emerald-800 py-1 pl-5"
        >
          <p className="text-lg font-semibold italic leading-8 text-zinc-800">
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <cite className="mt-2 block text-sm font-bold not-italic text-zinc-500">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={key}
          className={`my-2 space-y-2 pl-5 text-base leading-7 text-zinc-700 ${
            block.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }

    case "horizontal-rule":
      return <hr key={key} className="my-8 border-zinc-200" />;
  }
}

export function ArticleContent({ blocks }: Props) {
  return (
    <div className="space-y-4">{blocks.map((block, i) => renderBlock(block, i))}</div>
  );
}
