import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FootballKE — Kenyan Football News",
    short_name: "FootballKE",
    description:
      "Kenyan Premier League news, fixtures, live scores, standings, transfers, clubs and player profiles.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f4ef",
    theme_color: "#065f46",
    lang: "en-KE",
    categories: ["sports", "news"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
