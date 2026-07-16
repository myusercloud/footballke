import type { MetadataRoute } from "next";
import newsService from "@/services/news.service";
import clubService from "@/services/club.service";
import playerService from "@/services/player.service";
import tournamentService from "@/services/tournament.service";

const BASE = "https://footballke.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ articles }, { clubs }, { players }, groups, featuredPlayers] =
    await Promise.all([
      newsService.getNews({ pageSize: 500 }),
      clubService.getClubs({ pageSize: 500 }),
      playerService.getPlayers({ pageSize: 500 }),
      tournamentService.getGroups(),
      tournamentService.getFeaturedPlayers(200),
    ]);

  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                   changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/news`,               changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/fixtures`,           changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/standings`,          changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/transfers`,          changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/clubs`,              changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/players`,            changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/world-cup`,          changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/world-cup/fixtures`, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/world-cup/groups`,   changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/world-cup/news`,     changeFrequency: "daily",   priority: 0.7 },
  ];

  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/news/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
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

  const wcTeamSlugs = new Set<string>();
  for (const group of groups) {
    for (const team of group.teams) wcTeamSlugs.add(team.slug);
  }
  const wcTeamUrls: MetadataRoute.Sitemap = Array.from(wcTeamSlugs).map((slug) => ({
    url: `${BASE}/world-cup/teams/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const wcPlayerUrls: MetadataRoute.Sitemap = featuredPlayers.map((p) => ({
    url: `${BASE}/world-cup/players/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...statics,
    ...articleUrls,
    ...clubUrls,
    ...playerUrls,
    ...wcTeamUrls,
    ...wcPlayerUrls,
  ];
}
