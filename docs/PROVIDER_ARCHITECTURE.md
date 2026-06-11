# Provider Architecture

> **Status**: Implemented on branch `feature/provider-layer`.
> Describes the architecture **after** the refactor.
>
> For the pre-refactor baseline see `docs/CURRENT_DATA_FLOW.md`.
> For the migration roadmap see `docs/FUTURE_AUTOMATION.md`.

---

## Why This Layer Exists

Before the refactor, services imported JSON directly. Swapping the data source
for any domain required rewriting the service — even though the business logic
(filter, sort, paginate, build standings table) is identical regardless of
whether data comes from a file, a CMS, or a sports API.

The provider layer solves this by separating two distinct responsibilities:

| Responsibility | Where it lives | Examples |
|---|---|---|
| **Data access** | `providers/` | JSON read, HTTP fetch, CMS query, ID→entity resolution, field mapping |
| **Business logic** | `services/` | Category filter, canonical standings sort, zone assignment, pagination |

Services depend on a *provider interface*, not on any concrete data source.
To switch backends, only `providers/config.ts` changes — nothing in the service,
cache, or UI layers needs to move.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGES   app/*/page.tsx                                          │
│  Next.js Server Components — await cache functions              │
└───────────────────────────────┬─────────────────────────────────┘
                                │ calls
┌───────────────────────────────▼─────────────────────────────────┐
│  CACHE   lib/*.cache.ts                                          │
│  React cache() — per-request deduplication                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ calls
┌───────────────────────────────▼─────────────────────────────────┐
│  SERVICES   services/*.service.ts                                │
│  Business logic only: filter · sort · paginate · buildTable()   │
│  Depends on provider interfaces, not concrete classes           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ constructor injection
                                │ via providers/config.ts
┌───────────────────────────────▼─────────────────────────────────┐
│  PROVIDERS   providers/                                          │
│  Data access: raw types · ID resolution · field mapping         │
│                                                                  │
│  providers/config.ts  ← reads CONTENT_SOURCE env var            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ JsonXxxProv  │  │  CMSXxxProv  │  │  APIXxxProv  │          │
│  │  (default)   │  │   (stub)     │  │   (stub)     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │
          ▼                ▼                ▼
      data/*.json       CMS API        REST / Sports API
   (local JSON files)  (future)            (future)
```

---

## Layer Responsibilities

### Pages (`app/*/page.tsx`)
- Call cache functions only — no service or provider imports
- Pass typed props to Server Components
- Export `metadata` for SEO

### Cache (`lib/*.cache.ts`)
- Wrap service calls in `React.cache()` for per-request memoization
- One cache function per service method that a page calls
- No business logic; no data knowledge

### Services (`services/*.service.ts`)
- Filter, sort, paginate, and aggregate resolved domain objects
- Accept a provider via constructor injection
- Implement the `IXxxService` interface consumed by the cache layer
- **Must not** know what storage format the provider uses

### Providers (`providers/`)
- Return fully-resolved domain objects (`Article`, `Fixture`, etc.)
- **Must not** filter, sort, or paginate — those are service concerns
- Raw types and mapper functions are private to the provider module

### Data (`data/*.json`, CMS, API)
- The actual storage backend
- The JSON files are the current default; CMS and API are future options

---

## File Inventory

```
providers/
├── config.ts                    ← factory; reads CONTENT_SOURCE
│
├── news/
│   ├── NewsProvider.ts          interface: getAllArticles, getArticleBySlug, ...
│   ├── JsonNewsProvider.ts      reads data/news.json
│   ├── CMSNewsProvider.ts       stub — throws "not implemented"
│   └── APINewsProvider.ts       stub — throws "not implemented"
│
├── fixtures/
│   ├── FixturesProvider.ts      interface: getAllFixtures, getFixtureById, ...
│   ├── JsonFixturesProvider.ts  reads data/fixtures.json
│   ├── CMSFixturesProvider.ts   stub
│   └── APIFixturesProvider.ts   stub
│
├── standings/
│   ├── StandingsProvider.ts     interface + ProviderStandingRow/Entry types
│   ├── JsonStandingsProvider.ts reads data/standings.json
│   ├── CMSStandingsProvider.ts  stub
│   └── APIStandingsProvider.ts  stub
│
└── transfers/
    ├── TransfersProvider.ts     interface: getAllTransfers, getAllClubs
    ├── JsonTransfersProvider.ts reads data/transfers.json
    ├── CMSTransfersProvider.ts  stub
    └── APITransfersProvider.ts  stub
```

---

## Switching Backends

The `CONTENT_SOURCE` environment variable controls which provider class is
instantiated for all four domains simultaneously.

| Value | Provider selected | When to use |
|---|---|---|
| `json` (default) | `JsonXxxProvider` | Local dev, staging with static data |
| `cms` | `CMSXxxProvider` | After implementing the CMS providers |
| `api` | `APIXxxProvider` | After implementing the API providers |

Set it in `.env.local` for local development:

```
CONTENT_SOURCE=json
```

Or in the Vercel dashboard under Project → Settings → Environment Variables.

`providers/config.ts` reads the variable and returns the correct provider.
All four domains switch together. For per-domain control, see
`docs/FUTURE_AUTOMATION.md` (hybrid model section).

---

## Constructor Injection Pattern

Each service class accepts a provider via its constructor:

```typescript
// services/news.service.ts
class NewsService implements INewsService {
  constructor(private readonly provider: NewsProvider) {}

  async getNews(params: GetNewsParams = {}): Promise<NewsResponse> {
    let filtered = await this.provider.getAllArticles();
    // ... filter, sort, paginate ...
  }
}

// Singleton wired at module load time
const newsService: INewsService = new NewsService(getNewsProvider());
export default newsService;
```

The singleton is module-level, so `getNewsProvider()` is called once per
Node.js process. In Next.js the server module is loaded once per deployment
(or per cold start in serverless). The provider object is shared across
all requests; each *request* gets a fresh cache layer via `React.cache()`.

---

## Provider Interface Design

Providers follow three rules:

1. **Return fully-resolved domain objects.** No raw ID strings exposed to the
   service. The provider resolves `authorId → Author`, `homeTeamId → Team`, etc.
   before returning.

2. **No business logic.** No filtering, sorting, or pagination. Return all
   records and let the service decide what to do with them.

3. **Async always.** All methods return `Promise<T>` even when the underlying
   operation is synchronous (e.g. JSON read). This lets future implementations
   make network calls without changing the interface signature.

### Why `ProviderStandingRow` Is an Exception

Standings are special: `position`, `goalDifference`, `points`, and `zone` are
all *derived* by the service's `buildTable()` method — they are not stored in
the data source. The standings provider therefore returns unranked raw rows
(`ProviderStandingRow`) with the lookup data needed to build the table
(`getAllClubs()`, `getAllCompetitions()`). This is an intentional design choice,
not an inconsistency.

---

## Adding a New Provider

To implement, for example, a Sanity CMS backend for news:

**Step 1** — Open `providers/news/CMSNewsProvider.ts` and implement each method:

```typescript
import createClient from "@sanity/client";
import type { NewsProvider } from "./NewsProvider";
import type { Article, Author, Category } from "@/types/news";

const client = createClient({ projectId: "...", dataset: "production", useCdn: true });

export class CMSNewsProvider implements NewsProvider {
  async getAllArticles(): Promise<Article[]> {
    const raw = await client.fetch(`*[_type == "article"]{ ... }`);
    return raw.map(mapSanityArticle);   // your mapper here
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const raw = await client.fetch(`*[_type == "article" && slug.current == $slug][0]`, { slug });
    return raw ? mapSanityArticle(raw) : null;
  }
  // ... getAllCategories(), getAllAuthors()
}
```

**Step 2** — Set `CONTENT_SOURCE=cms` in `.env.local`.

**Step 3** — Run `npm run dev` and verify pages load correctly.

No changes required in `services/`, `lib/`, `app/`, or `components/`.

---

## TypeScript Notes

### `Promise<never>` for stubs

Stub methods are declared `async method(): Promise<never>`. This satisfies the
interface because `never` is TypeScript's bottom type — it is assignable to
every other type, so `Promise<never>` is assignable to `Promise<Article[]>`.
Without the explicit `Promise<never>` annotation, TypeScript would infer
`Promise<void>`, which is *not* assignable to `Promise<Article[]>`.

### `satisfies` for const arrays

`lib/transfers.utils.ts` uses the `satisfies` operator:

```typescript
export const TRANSFER_STATUSES = ["confirmed", "loan", "rumour", "exit"]
  as const satisfies readonly TransferStatus[];
```

This gives both literal-type narrowing (`"confirmed" | "loan" | ...`) *and*
compile-time validation that the array covers exactly the values in the union.
