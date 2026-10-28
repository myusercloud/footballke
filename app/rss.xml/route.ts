import newsService from "@/services/news.service";

const BASE_URL = "https://footballke.site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { articles } = await newsService.getNews({ pageSize: 50 });
  const lastBuildDate = articles[0]
    ? new Date(articles[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const items = articles
    .map((article) => {
      const url = `${BASE_URL}/news/${article.slug}`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(article.author.name)}</dc:creator>
      <category>${escapeXml(article.category.name)}</category>
${article.tags
  .map((tag) => `      <category>${escapeXml(tag)}</category>`)
  .join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>FootballKE — Kenyan Football News</title>
    <link>${BASE_URL}</link>
    <description>Kenyan Premier League news, fixtures, results, standings, transfers and analysis.</description>
    <language>en-KE</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
