import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/news.cache";
import { formatDate } from "@/lib/news.utils";

export const alt = "FootballKE article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const title = truncate(
    article?.title ?? "Kenyan football news, fixtures and analysis",
    118
  );
  const category = article?.category.name ?? "FootballKE";
  const author = article?.author.name ?? "FootballKE";
  const date = article ? formatDate(article.publishedAt) : "footballke.site";
  const readingTime = article ? `${article.readingTime} min read` : "News";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #052e16 0%, #064e3b 52%, #022c22 100%)",
          color: "#ffffff",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            right: -170,
            top: -210,
            background: "rgba(16, 185, 129, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            right: 130,
            bottom: -230,
            background: "rgba(52, 211, 153, 0.12)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  background: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#052e16",
                }}
              >
                F
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5 }}>
                  FootballKE
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 3.2,
                    color: "#6ee7b7",
                    textTransform: "uppercase",
                  }}
                >
                  Kenyan football · news · analysis
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 18px",
              borderRadius: 999,
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(110, 231, 183, 0.45)",
              color: "#a7f3d0",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ width: 86, height: 7, background: "#34d399" }} />
          <div
            style={{
              fontSize: title.length > 88 ? 48 : 56,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: -1.4,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.18)",
            paddingTop: 22,
            fontSize: 20,
            color: "#d1fae5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontWeight: 800, color: "#ffffff" }}>{author}</span>
            <span style={{ color: "#6ee7b7" }}>·</span>
            <span>{date}</span>
            <span style={{ color: "#6ee7b7" }}>·</span>
            <span>{readingTime}</span>
          </div>
          <span style={{ fontWeight: 800, color: "#6ee7b7" }}>footballke.site</span>
        </div>
      </div>
    ),
    size
  );
}
