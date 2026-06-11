# Future Automation Roadmap

> **Status**: Forward-looking. Describes migrations to CMS and sports data API
> backends once the site grows beyond static JSON.
>
> For the implemented provider architecture see `docs/PROVIDER_ARCHITECTURE.md`.

---

## Overview

FootballKE currently uses static JSON files as its data source. This works well
for a prototype but has three practical limits:

1. **Content updates require a code deployment.** Editing a news article means
   editing a JSON file and pushing to `main`.
2. **No live data.** Fixtures and standings are manually updated — there is no
   connection to a match data feed.
3. **No CMS workflow.** There is no editorial interface for writers or editors.

The provider layer was built to remove all three of these constraints without
touching the business logic in services, the cache layer, or the UI. When the
time comes, only the `providers/` directory changes.

---

## Migration Targets

### Target 1 — CMS for editorial content

**Affects:** news, transfers (and optionally fixtures for manual match entry)

**When:** Once there is a regular content publishing workflow — a second editor,
a publishing schedule, or a need to preview articles before going live.

**Recommended CMS options:**

| CMS | Why it fits |
|---|---|
| **Sanity** | Flexible schema, GROQ query language, real-time Studio, free tier generous |
| **Contentful** | Mature, strong TypeScript SDK, good media handling for cover images |
| **Strapi** | Self-hosted option if data sovereignty matters; REST + GraphQL out of the box |
| **Payload CMS** | Next.js-native, TypeScript-first, can be colocated in this repo |

**Implementation steps:**

1. Choose a CMS and model the schema to match the `Article`, `Category`, `Author`,
   `Transfer`, and `TransferClub` types in `types/news.ts` and `types/transfer.ts`.

2. Install the CMS client SDK (e.g. `npm install @sanity/client`).

3. Implement `CMSNewsProvider` and `CMSTransfersProvider` in `providers/news/` and
   `providers/transfers/`. Each method fetches from the CMS and maps the response
   to the domain type. The mapper lives entirely inside the provider file.

4. Add the CMS API token to `.env.local` (and to Vercel environment variables).

5. Set `CONTENT_SOURCE=cms` in the environment.

6. Verify with `npx tsc --noEmit` and `npm run dev`.

No changes required outside `providers/`.

---

### Target 2 — Sports data API for live match data

**Affects:** fixtures, standings

**When:** Once there is a need for live scores, real-time standings updates,
or automated fixture imports.

**Available APIs — KPL coverage:**

KPL (Kenyan Premier League) coverage in commercial sports data APIs is limited.
Check current coverage before committing to an API:

| API | KPL availability | Notes |
|---|---|---|
| **API-Football** (RapidAPI) | Partial — league ID 675 | Verify fixture depth and standings freshness |
| **SportMonks** | Check current plan | Strong for African leagues on higher tiers |
| **TheSportsDB** | Free, community-updated | Less reliable for KPL; no live scores |
| **Custom scraper** | Full (FKF / KPL website) | Requires maintenance; legal grey area |

**Implementation steps:**

1. Acquire API credentials and confirm KPL data is available.

2. Implement `APIFixturesProvider` in `providers/fixtures/`. The method
   `getAllFixtures()` must:
   - Fetch from the API endpoint
   - Map the API response to the `Fixture` type (Team, Competition, Venue all resolved)
   - Cache the response if the API has rate limits (e.g. using `node-cache` or a
     Redis store at the provider level — separate from `React.cache()` which is
     per-request only)

3. Implement `APIStandingsProvider` in `providers/standings/`. Return
   `ProviderStandingsEntry[]` — unranked rows with `clubId` references. The
   service's `buildTable()` will calculate positions, goal difference, and zones.

4. Set `CONTENT_SOURCE=api`.

**Rate limit considerations:**

`React.cache()` deduplicates calls *within a single render*, not across requests.
If the sports API has a low rate limit or charges per call, add an in-process
cache inside the provider:

```typescript
// providers/fixtures/APIFixturesProvider.ts
import NodeCache from "node-cache";

const ttlCache = new NodeCache({ stdTTL: 300 }); // 5-minute TTL

export class APIFixturesProvider implements FixturesProvider {
  async getAllFixtures(): Promise<Fixture[]> {
    const cached = ttlCache.get<Fixture[]>("fixtures");
    if (cached) return cached;

    const raw = await fetch("https://api.example.com/fixtures?league=675");
    const fixtures = (await raw.json()).map(mapAPIFixture);
    ttlCache.set("fixtures", fixtures);
    return fixtures;
  }
  // ...
}
```

This is the provider's concern — services and pages are unaware of it.

---

### Target 3 — Hybrid model (CMS + API)

**When:** CMS covers editorial content; a sports API covers live match data.
This is the most likely production configuration.

In this model, news and transfers come from a CMS while fixtures and standings
come from a sports API. The current `CONTENT_SOURCE` variable switches all four
domains together, which is not ideal for hybrid use.

**Extension: per-domain env vars**

Add domain-specific overrides to `providers/config.ts`:

```typescript
function getSource(domain: "news" | "fixtures" | "standings" | "transfers"): ContentSource {
  const domainKey = `CONTENT_SOURCE_${domain.toUpperCase()}` as const;
  const raw = process.env[domainKey] ?? process.env.CONTENT_SOURCE;
  if (raw === "cms" || raw === "api") return raw;
  return "json";
}

export function getNewsProvider(): NewsProvider {
  switch (getSource("news")) {
    case "cms": return new CMSNewsProvider();
    case "api": return new APINewsProvider();
    default:    return new JsonNewsProvider();
  }
}
// Same pattern for other domains
```

`.env.local` for hybrid mode:

```
CONTENT_SOURCE_NEWS=cms
CONTENT_SOURCE_TRANSFERS=cms
CONTENT_SOURCE_FIXTURES=api
CONTENT_SOURCE_STANDINGS=api
```

Only `providers/config.ts` changes — the rest of the codebase is unaffected.

---

## Incremental Migration Path

```
Phase 0 (now)
  data/*.json → JsonXxxProvider → all four domains

Phase 1 (CMS for editorial)
  news.json     → CMSNewsProvider      ← editorial workflow unlocked
  transfers.json → CMSTransfersProvider
  data/*.json   → JsonXxxProvider      ← fixtures/standings stay static

Phase 2 (API for live data)
  CMSNewsProvider      ← unchanged
  CMSTransfersProvider ← unchanged
  APIFixturesProvider  ← live scores + automated fixture import
  APIStandingsProvider ← automated standings updates

Phase 3 (optional: ISR / webhooks)
  CMS webhook → POST /api/revalidate → Next.js on-demand ISR
  API polling → background job → update standings cache
```

---

## Next.js ISR and On-Demand Revalidation

Static generation with ISR is the right caching strategy once a real backend
is in place. The cache layer (`lib/*.cache.ts`) currently uses `React.cache()`
for per-request deduplication only. For cross-request persistence, add
`revalidate` at the page or fetch level:

**Page-level revalidation (standings — refresh every 5 minutes during a match):**

```typescript
// app/standings/page.tsx
export const revalidate = 300; // seconds
```

**On-demand revalidation via CMS webhook:**

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { secret, path } = await req.json();
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

The CMS webhook POSTs to `/api/revalidate` whenever an article is published.
The provider layer is not involved — this is a Next.js concern.

---

## What Never Changes

Regardless of which migration phase is active, the following files require
**no modification** when switching backends:

- `types/*.ts` — domain type contracts
- `lib/*.cache.ts` — cache wrappers
- `app/*/page.tsx` — pages and routes
- `components/**` — all UI components
- `services/*.service.ts` — business logic

Only `providers/` and environment variables change.
