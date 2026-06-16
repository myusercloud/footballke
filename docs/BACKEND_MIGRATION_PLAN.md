# FootballKE — Backend Migration Plan

> Phase 0 analysis — written before any code changes.
> Read this before touching anything.

---

## 1. Current Architecture

```
Browser / SSR Request
        │
        ▼
┌─────────────────────────┐
│  Next.js App Router     │  app/[feature]/page.tsx
│  (Server Components)    │
└────────────┬────────────┘
             │ imports singleton
             ▼
┌─────────────────────────┐
│  Service Layer          │  services/[feature].service.ts
│  INewsService           │  Filtering, sorting, pagination
│  IFixturesService       │  Pure TypeScript — no I/O
│  IStandingsService      │
│  IClubService           │
│  IPlayerService         │
│  ITournamentService     │
│  ITransfersService      │
└────────────┬────────────┘
             │ calls provider
             ▼
┌─────────────────────────┐
│  Provider Layer         │  providers/[feature]/[Type]Provider.ts
│  (selected by config)   │
│  CONTENT_SOURCE env var │
└────────────┬────────────┘
             │ reads
             ▼
┌─────────────────────────┐
│  JSON Files             │  data/*.json
│  (current default)      │  data/world-cup/*.json
└─────────────────────────┘
```

### Provider selection flow

`providers/config.ts` reads `process.env.CONTENT_SOURCE` at module load time and returns the correct provider:

| `CONTENT_SOURCE` | Provider selected       |
|-----------------|------------------------|
| `json` (default) | `JsonXxxProvider`     |
| `cms`            | `CMSXxxProvider`      |
| `api`            | `APIXxxProvider`      |

Tournament data uses a separate `TOURNAMENT_SOURCE` env var, allowing the KPL backend and World Cup backend to be switched independently.

---

## 2. Existing Services

| Service | File | Interface |
|---------|------|-----------|
| News | `services/news.service.ts` | `INewsService` |
| Fixtures | `services/fixtures.service.ts` | `IFixturesService` |
| Standings | `services/standings.service.ts` | `IStandingsService` |
| Clubs | `services/club.service.ts` | `IClubService` |
| Players | `services/player.service.ts` | `IPlayerService` |
| Tournament | `services/tournament.service.ts` | `ITournamentService` |
| Transfers | `services/transfers.service.ts` | `ITransfersService` |

Each service is a singleton exported at module level. Pages import the singleton directly — no dependency injection, no context providers.

---

## 3. Existing Providers

Each domain has three implementations, all co-located under `providers/[domain]/`:

| Domain | Json | CMS (stub) | API (stub) |
|--------|------|-----------|-----------|
| News | `JsonNewsProvider` | `CMSNewsProvider` | `APINewsProvider` |
| Fixtures | `JsonFixturesProvider` | `CMSFixturesProvider` | `APIFixturesProvider` |
| Standings | `JsonStandingsProvider` | `CMSStandingsProvider` | `APIStandingsProvider` |
| Clubs | `JsonClubProvider` | `CMSClubProvider` | `APIClubProvider` |
| Players | `JsonPlayerProvider` | `CMSPlayerProvider` | `APIPlayerProvider` |
| Tournaments | `JsonTournamentProvider` | `CMSTournamentProvider` | `APITournamentProvider` |
| Transfers | `JsonTransfersProvider` | `CMSTransfersProvider` | `APITransfersProvider` |

CMS and API providers currently throw `"not implemented"` on every method. **The migration fills these in — it does not create new provider files.**

---

## 4. Existing Data Flow (JSON path)

```
data/news.json
  └─ JsonNewsProvider
       └─ reads rawData at import time
       └─ mapArticle() resolves authorId → Author, categorySlug → Category
       └─ calculateReadingTime() derives readingTime
       └─ returns Article[]

data/fixtures.json
  └─ JsonFixturesProvider
       └─ reads and normalises at import time
       └─ returns fully-resolved Fixture[]

data/standings.json
  └─ JsonStandingsProvider
       └─ returns ProviderStandingsEntry[] (unranked rows + metadata)
       └─ service builds positions, zones, sort

data/clubs.json
  └─ JsonClubProvider
       └─ returns Club[]

data/players.json
  └─ JsonPlayerProvider
       └─ derives age from dateOfBirth at read time
       └─ returns Player[]

data/transfers.json
  └─ JsonTransfersProvider
       └─ returns Transfer[]

data/world-cup/
  ├─ tournament.json     → Tournament metadata
  ├─ groups.json         → TournamentGroup[]
  ├─ fixtures.json       → Fixture[] (WC matches)
  ├─ standings.json      → GroupStandingsTable[]
  ├─ top-scorers.json    → TopScorer[]
  ├─ featured-players.json → TournamentPlayer[]
  └─ squads.json         → SquadPlayer[] keyed by team slug
  └─ JsonTournamentProvider → stitches all of the above
```

---

## 5. Current JSON Files

| File | Records (approx) | Notes |
|------|-----------------|-------|
| `data/news.json` | ~10 articles, 5 authors, 6 categories | Portable-text content blocks |
| `data/fixtures.json` | ~20 fixtures | KPL matches, fully denormalised |
| `data/standings.json` | 1 table, 18 rows | KPL 2025/26 |
| `data/clubs.json` | 18 clubs | Full club entities |
| `data/players.json` | ~180 players | 10 per club |
| `data/transfers.json` | ~30 transfers | Summer 2026 window |
| `data/world-cup/` | Full WC 2026 dataset | 32 teams, 48 fixtures, 6 groups |

---

## 6. What Must Remain Unchanged

### Pages and components
- All `app/` pages and `components/` are **read-only** during migration.
- No page may be modified to change how it imports from services.
- The singleton export pattern (`export default newsService`) must be preserved.

### Service interfaces
- `INewsService`, `IFixturesService`, etc. in `types/` are **frozen contracts**.
- Any backend changes that would require changing these interfaces are out-of-scope.

### Provider interfaces
- `NewsProvider`, `FixturesProvider`, etc. are **frozen contracts**.
- The API providers must satisfy these interfaces exactly.

### Env-var switch
- `CONTENT_SOURCE=json` must continue to serve the JSON-backed site without any backend running.
- `CONTENT_SOURCE=api` activates the new NestJS backend.
- No page or service should know or care which is active.

### JSON files
- `data/*.json` and `data/world-cup/*.json` are **never deleted** during migration.
- They remain the fallback when `CONTENT_SOURCE=json`.

---

## 7. Migration Risks

| Risk | Mitigation |
|------|-----------|
| Provider interface drift | API providers implement identical interfaces; TypeScript enforces it |
| Response shape mismatch | API response DTOs must match the types in `types/*.ts` exactly |
| Missing seed data | Seed scripts read from existing JSON files; zero data loss |
| DB migration failures | Prisma generates reversible migrations; seed is idempotent |
| CMS content divergence | CMS writes to same DB as API reads; single source of truth |
| Docker network issues | All services on shared `internal` bridge; health checks before routing |
| Broken pages during cutover | `CONTENT_SOURCE=json` keeps the site live until `api` is verified |

---

## 8. Target Architecture

```
Browser / SSR Request
        │
        ▼
┌─────────────────────────┐
│  Next.js App Router     │  unchanged
└────────────┬────────────┘
             │ unchanged
             ▼
┌─────────────────────────┐
│  Service Layer          │  unchanged
└────────────┬────────────┘
             │ CONTENT_SOURCE=api
             ▼
┌─────────────────────────┐
│  APIXxxProvider         │  providers/[domain]/APIXxxProvider.ts
│  (newly implemented)    │  HTTP calls to NestJS API
└────────────┬────────────┘
             │ REST/JSON
             ▼
┌─────────────────────────┐
│  NestJS API             │  footballke-api/ (port 4000)
│  Controllers + Services │
└────────────┬────────────┘
             │ Prisma ORM
             ▼
┌─────────────────────────┐
│  PostgreSQL             │  shared database (port 5432)
└──────────┬──────────────┘
           │ also connected to
           ▼
┌─────────────────────────┐
│  Payload CMS            │  footballke-cms/ (port 3001)
│  Admin UI               │  Editors manage content here
└─────────────────────────┘
```

### Service mapping

| Frontend provider calls | NestJS endpoint |
|------------------------|-----------------|
| `getAllArticles()` | `GET /api/news` |
| `getArticleBySlug(slug)` | `GET /api/news/:slug` |
| `getAllCategories()` | `GET /api/news/categories` |
| `getAllAuthors()` | `GET /api/news/authors` |
| `getAllFixtures()` | `GET /api/fixtures` |
| `getFixtureById(id)` | `GET /api/fixtures/:id` |
| `getAllCompetitions()` | `GET /api/fixtures/competitions` |
| `getAllEntries()` | `GET /api/standings` |
| `getAllClubs()` | `GET /api/clubs` |
| `getClubBySlug(slug)` | `GET /api/clubs/:slug` |
| `getAllPlayers()` | `GET /api/players` |
| `getPlayerBySlug(slug)` | `GET /api/players/:slug` |
| `getPlayersByClub(slug)` | `GET /api/players?clubSlug=:slug` |
| `getTournament()` | `GET /api/tournaments/:slug` |
| `getGroups()` | `GET /api/tournaments/:slug/groups` |
| `getFixtures()` (WC) | `GET /api/tournaments/:slug/fixtures` |
| `getAllTransfers()` | `GET /api/transfers` |

---

## 9. Migration Checklist

- [ ] Phase 0: This document
- [ ] Phase 1: NestJS scaffolding + health endpoint
- [ ] Phase 2: Prisma schema + migrations
- [ ] Phase 3: Seed scripts run, DB populated from JSON
- [ ] Phase 4: Payload CMS collecting, admin UI functional
- [ ] Phase 5: All API endpoints return correct shapes
- [ ] Phase 6: `APIXxxProvider` classes implemented, `CONTENT_SOURCE=api` works
- [ ] Phase 7: Docker stack boots with `docker compose up`
- [ ] Phase 8: Operations docs complete
- [ ] Phase 9: Admin npm scripts working
- [ ] Phase 10: FINAL_REPORT.md generated
