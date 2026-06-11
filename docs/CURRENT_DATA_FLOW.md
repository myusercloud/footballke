# Current Data Flow

> **Status**: Pre-provider-layer. Describes the architecture as it stands before
> the provider refactor on branch `feature/provider-layer`.
>
> For the target architecture see `docs/PROVIDER_ARCHITECTURE.md` (created during the refactor).

---

## Overview

```
Browser
  │
  ▼
app/*/page.tsx          (Next.js Server Component — async)
  │
  ▼
lib/*.cache.ts          (React cache() — per-request memoization)
  │
  ▼
services/*.service.ts   (Business logic: filter, sort, paginate)
  │  ← JSON imported directly here ──┐
  ▼                                  │
data/*.json  ◄──────────────────────┘
```

Every data request in the application passes through this exact four-step chain.
There is no intermediate abstraction between the service and the JSON file.

---

## Coupling Points — Where JSON Is Imported Directly

All four direct JSON imports live in the service layer:

| File | Import | What it loads |
|---|---|---|
| `services/news.service.ts:11` | `import rawData from "@/data/news.json"` | articles, authors, categories |
| `services/fixtures.service.ts:13` | `import rawData from "@/data/fixtures.json"` | fixtures, teams, competitions, venues |
| `services/standings.service.ts:14` | `import rawData from "@/data/standings.json"` | standings, clubs, competitions |
| `services/transfers.service.ts:9` | `import rawData from "@/data/transfers.json"` | transfers, clubs |

No other file imports from `data/` directly. Components, pages, and `lib/` are
fully isolated from the storage format.

---

## What Each Service Currently Does

Each service class conflates two distinct responsibilities:

### Responsibility A — Data access (should move to Provider)
- Importing the JSON file
- Defining the raw JSON shape (`RawData`, `RawArticle`, `RawFixture`, etc.)
- Resolving normalized IDs into full entities (`authorId` → `Author`, `homeTeamId` → `Team`)
- Mapping raw shapes to the domain types declared in `types/`

### Responsibility B — Business logic (stays in Service)
- Filtering by query params (competition, category, status, date range, club)
- Sorting (newest-first, kickoff order, canonical standings sort)
- Pagination (page + pageSize → slice)
- Aggregation (e.g. standings `buildTable()` — canonical sort, zone assignment)

**The problem**: Because both responsibilities live in the same class, swapping
the data source requires rewriting the service — even though the business logic
is identical regardless of whether data comes from JSON, a CMS, or a REST API.

---

## Internal Raw Types (Currently Hidden Inside Services)

Each service defines private types that describe the exact JSON shape.
These types are not exported and not tested independently.

### `services/news.service.ts`
```typescript
type RawArticle = {
  id, slug, title, excerpt, content: ContentBlock[],
  authorId: string,       // ← normalized reference, resolved to Author
  categorySlug: string,   // ← normalized reference, resolved to Category
  tags, publishedAt, updatedAt, featured, relatedSlugs
};
type RawData = { categories: Category[]; authors: Author[]; articles: RawArticle[] };
```

**Mapping work done**: `authorId` → `Author` lookup; `categorySlug` → `Category`
lookup; `readingTime` derived from `calculateReadingTime(content)` (not stored).

### `services/fixtures.service.ts`
```typescript
type RawFixture = {
  id, homeTeamId, awayTeamId, competitionId, venueId,  // ← all normalized
  kickoff, status, matchday, score, liveMinute, stats,
  homeForm, awayForm, preview, relatedNewsSlugs, featured
};
type RawData = { teams: Team[]; competitions: Competition[]; venues: Venue[]; fixtures: RawFixture[] };
```

**Mapping work done**: 4 ID lookups per fixture (homeTeam, awayTeam, competition, venue).

### `services/standings.service.ts`
```typescript
type RawRow = { clubId, played, won, drawn, lost, goalsFor, goalsAgainst, form };
type RawStandings = { id, competitionId, season, updatedAt, zones, rows: RawRow[] };
type RawData = { clubs: Club[]; competitions: StandingsCompetition[]; standings: RawStandings[] };
```

**Mapping work done**: `clubId` → `Club` lookup; `points` and `goalDifference`
derived (not stored); canonical position calculated; zone assigned.

### `services/transfers.service.ts`
```typescript
type RawTransfer = Omit<Transfer, "fromClub" | "toClub"> & {
  fromClubId: string;
  toClubId: string;
};
type RawData = { clubs: TransferClub[]; transfers: RawTransfer[] };
```

**Mapping work done**: `fromClubId` + `toClubId` → `TransferClub` lookups.

---

## End-to-End Trace — News Article Page

This traces `/news/gor-mahia-signs-striker` from browser to rendered HTML.

```
1. Browser GET /news/gor-mahia-signs-striker
       │
       ▼
2. app/news/[slug]/page.tsx
       │  const slug = (await params).slug
       │  const [article, related] = await Promise.all([
       │    getArticle(slug),
       │    ...
       │  ])
       │
       ▼
3. lib/news.cache.ts
       │  getArticle = cache((slug) => newsService.getNewsBySlug(slug))
       │  React cache deduplicates — generateMetadata called this slug already,
       │  so the service is only invoked once.
       │
       ▼
4. services/news.service.ts  ← JSON COUPLING POINT
       │  this.data = rawData as RawData          ← data/news.json loaded here
       │  const raw = this.data.articles.find(a => a.slug === slug)
       │  return mapArticle(raw, this.data)
       │    → finds author by raw.authorId
       │    → finds category by raw.categorySlug
       │    → derives readingTime from calculateReadingTime(raw.content)
       │
       ▼
5. Article { id, slug, title, author: Author, category: Category, readingTime, ... }
       │
       ▼
6. app/news/[slug]/page.tsx renders ArticleHeader, ArticleContent, RelatedArticles
       │
       ▼
7. HTML streamed to browser (no client-side data fetching)
```

---

## End-to-End Trace — Standings Page

```
1. Browser GET /standings?sort=points
       │
       ▼
2. app/standings/page.tsx
       │  const sortBy = parseSort(sort)   // "points"
       │  const [result, competitions] = await Promise.all([
       │    getStandings({ competitionSlug, season, sortBy }),
       │    getStandingsCompetitions()
       │  ])
       │
       ▼
3. lib/standings.cache.ts
       │  cache() wrappers — deduplicates per render
       │
       ▼
4. services/standings.service.ts  ← JSON COUPLING POINT
       │  this.data = rawData as RawData    ← data/standings.json
       │  findEntry(competitionSlug, season)
       │    → picks the most recently updated matching entry
       │  buildTable(entry, "points")
       │    → canonical sort (points → GD → GF → name) assigns positions 1–18
       │    → zone map built from entry.zones config
       │    → display re-sort by "points"
       │    → each row: clubId resolved to Club entity
       │
       ▼
5. StandingsResponse { table: StandingsTable, availableSeasons, availableCompetitions }
       │
       ▼
6. StandingsFilters (client island) + StandingsTable (server) rendered
```

---

## What Does NOT Touch JSON

The following layers are completely isolated from the storage format:

| Layer | Isolation mechanism |
|---|---|
| `types/*.ts` | Pure TypeScript type contracts — no imports |
| `lib/*.cache.ts` | Only imports from `services/` — no data knowledge |
| `app/*/page.tsx` | Only calls `lib/*.cache.ts` functions |
| `components/**` | Receives typed props — no data access |
| `lib/standings.utils.ts` | Tailwind class maps — no data |
| `lib/transfers.utils.ts` | Parse functions over string params — no data |

---

## Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  PAGES                                                       │
│  app/news/page.tsx   app/fixtures/page.tsx   app/standings/ │
└───────────────────────────────┬─────────────────────────────┘
                                │ calls
┌───────────────────────────────▼─────────────────────────────┐
│  CACHE LAYER   lib/*.cache.ts                                │
│  React cache() — per-request deduplication only             │
└───────────────────────────────┬─────────────────────────────┘
                                │ calls
┌───────────────────────────────▼─────────────────────────────┐
│  SERVICES   services/*.service.ts                           │
│  Business logic: filter · sort · paginate · aggregate       │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  ALSO handles: raw types · ID resolution · mapping    ║  │
│  ║  ← this is the mixed responsibility to be extracted   ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
└───────────────────────────────┬─────────────────────────────┘
                                │ import rawData from "..."
┌───────────────────────────────▼─────────────────────────────┐
│  DATA   data/*.json                                          │
│  news.json · fixtures.json · standings.json · transfers.json │
└─────────────────────────────────────────────────────────────┘
```

---

## Target Architecture (Provider Layer)

```
┌─────────────────────────────────────────────────────────────┐
│  PAGES   (unchanged)                                        │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  CACHE LAYER   (unchanged)                                  │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│  SERVICES   (business logic only — no JSON knowledge)       │
└───────────────────────────────┬─────────────────────────────┘
                                │ calls provider interface
┌───────────────────────────────▼─────────────────────────────┐
│  PROVIDERS   providers/                                     │
│  JsonNewsProvider · CMSNewsProvider · APINewsProvider       │
│  (selected at startup via CONTENT_SOURCE env var)           │
└───────────────────────────────┬─────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
      data/*.json          CMS API             REST API / Sports Provider
   (current default)     (future)                   (future)
```

---

## Files That Will Change During the Refactor

| File | Change |
|---|---|
| `services/news.service.ts` | Remove JSON import; inject `NewsProvider`; keep business logic |
| `services/fixtures.service.ts` | Same pattern |
| `services/standings.service.ts` | Same pattern |
| `services/transfers.service.ts` | Same pattern |
| `providers/news/NewsProvider.ts` | **New** — interface contract |
| `providers/news/JsonNewsProvider.ts` | **New** — moves raw types + mapping from service |
| `providers/news/CMSNewsProvider.ts` | **New** — placeholder stub |
| `providers/news/APINewsProvider.ts` | **New** — placeholder stub |
| `providers/fixtures/…` | Same three files for fixtures |
| `providers/standings/…` | Same three files for standings |
| `providers/transfers/…` | Same three files for transfers |
| `providers/config.ts` | **New** — factory; reads `CONTENT_SOURCE` env var |

## Files That Will NOT Change

`lib/*.cache.ts` · `app/*/page.tsx` · `components/**` · `types/*.ts` · `data/*.json`
