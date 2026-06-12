import type { NewsProvider } from "./news/NewsProvider";
import type { FixturesProvider } from "./fixtures/FixturesProvider";
import type { StandingsProvider } from "./standings/StandingsProvider";
import type { TransfersProvider } from "./transfers/TransfersProvider";
import type { ClubProvider } from "./clubs/ClubProvider";
import type { PlayerProvider } from "./players/PlayerProvider";

import { JsonNewsProvider } from "./news/JsonNewsProvider";
import { CMSNewsProvider } from "./news/CMSNewsProvider";
import { APINewsProvider } from "./news/APINewsProvider";

import { JsonFixturesProvider } from "./fixtures/JsonFixturesProvider";
import { CMSFixturesProvider } from "./fixtures/CMSFixturesProvider";
import { APIFixturesProvider } from "./fixtures/APIFixturesProvider";

import { JsonStandingsProvider } from "./standings/JsonStandingsProvider";
import { CMSStandingsProvider } from "./standings/CMSStandingsProvider";
import { APIStandingsProvider } from "./standings/APIStandingsProvider";

import { JsonTransfersProvider } from "./transfers/JsonTransfersProvider";
import { CMSTransfersProvider } from "./transfers/CMSTransfersProvider";
import { APITransfersProvider } from "./transfers/APITransfersProvider";

import { JsonClubProvider } from "./clubs/JsonClubProvider";
import { CMSClubProvider } from "./clubs/CMSClubProvider";
import { APIClubProvider } from "./clubs/APIClubProvider";

import { JsonPlayerProvider } from "./players/JsonPlayerProvider";
import { CMSPlayerProvider } from "./players/CMSPlayerProvider";
import { APIPlayerProvider } from "./players/APIPlayerProvider";

// ── Content source ────────────────────────────────────────────────────────────
//
// Set CONTENT_SOURCE in .env.local (or the Vercel environment) to switch all
// four domains to a different backend at once:
//
//   CONTENT_SOURCE=json   — reads data/*.json files (default, no config needed)
//   CONTENT_SOURCE=cms    — headless CMS (implement CMSXxxProvider first)
//   CONTENT_SOURCE=api    — sports data API (implement APIXxxProvider first)

type ContentSource = "json" | "cms" | "api";

function getContentSource(): ContentSource {
  const raw = process.env.CONTENT_SOURCE;
  if (raw === "cms" || raw === "api") return raw;
  return "json";
}

// ── Provider factories ────────────────────────────────────────────────────────
// Each factory is called once at module load time (service singletons are
// module-level). The switch is evaluated per-process, not per-request.

export function getNewsProvider(): NewsProvider {
  switch (getContentSource()) {
    case "cms": return new CMSNewsProvider();
    case "api": return new APINewsProvider();
    default:    return new JsonNewsProvider();
  }
}

export function getFixturesProvider(): FixturesProvider {
  switch (getContentSource()) {
    case "cms": return new CMSFixturesProvider();
    case "api": return new APIFixturesProvider();
    default:    return new JsonFixturesProvider();
  }
}

export function getStandingsProvider(): StandingsProvider {
  switch (getContentSource()) {
    case "cms": return new CMSStandingsProvider();
    case "api": return new APIStandingsProvider();
    default:    return new JsonStandingsProvider();
  }
}

export function getTransfersProvider(): TransfersProvider {
  switch (getContentSource()) {
    case "cms": return new CMSTransfersProvider();
    case "api": return new APITransfersProvider();
    default:    return new JsonTransfersProvider();
  }
}

export function getClubProvider(): ClubProvider {
  switch (getContentSource()) {
    case "cms": return new CMSClubProvider();
    case "api": return new APIClubProvider();
    default:    return new JsonClubProvider();
  }
}

export function getPlayerProvider(): PlayerProvider {
  switch (getContentSource()) {
    case "cms": return new CMSPlayerProvider();
    case "api": return new APIPlayerProvider();
    default:    return new JsonPlayerProvider();
  }
}
