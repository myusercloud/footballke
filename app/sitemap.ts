import type { MetadataRoute } from "next";
import newsService from "@/services/news.service";
import clubService from "@/services/club.service";
import playerService from "@/services/player.service";
import fixturesService from "@/services/fixtures.service";
import { slugifyVenue } from "@/lib/venue.utils";

const BASE = "https://footballke.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ articles }, { clubs }, { players }, { fixtures }] = await Promise.all([
    newsService.getNews({ pageSize: 500 }),
    clubService.getClubs({ pageSize: 500 }),
    playerService.getPlayers({ pageSize: 500 }),
    fixturesService.getFixtures({ pageSize: 1000 }),
  ]);

  const latestArticleDate = articles[0]
    ? new Date(articles[0].updatedAt ?? articles[0].publishedAt)
    : new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,          lastModified: latestArticleDate, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/news`,      lastModified: latestArticleDate, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/fixtures`,  lastModified: latestArticleDate, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/standings`, lastModified: latestArticleDate, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/transfers`, lastModified: latestArticleDate, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/clubs`,     lastModified: latestArticleDate, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/players`,   lastModified: latestArticleDate, changeFrequency: "weekly",  priority: 0.7 },
  ];

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/news/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: a.featured ? 0.9 : 0.8,
  }));

  const fixtureUrls: MetadataRoute.Sitemap = fixtures.map((f) => ({
    url: `${BASE}/fixtures/${f.id}`,
    lastModified: new Date(f.kickoff),
    changeFrequency: f.status === "scheduled" ? ("daily" as const) : ("weekly" as const),
    priority: f.featured ? 0.8 : 0.6,
  }));

  const venueSlugs = new Set(
    fixtures.map((f) => slugifyVenue(f.venue.name)).filter(Boolean)
  );

  const venueUrls: MetadataRoute.Sitemap = Array.from(venueSlugs).map((slug) => ({
    url: `${BASE}/venues/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const clubUrls: MetadataRoute.Sitemap = clubs.map((c) => ({
    url: `${BASE}/clubs/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const playerUrls: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${BASE}/players/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...statics,
    ...articleUrls,
    ...fixtureUrls,
    ...clubUrls,
    ...playerUrls,
    ...venueUrls,
  ];
}
