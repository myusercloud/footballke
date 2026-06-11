# Provider Layer Migration Report

> **Branch**: `feature/provider-layer`
> **Date**: 2026-06-11
> **Status**: Complete — all phases verified

---

## Summary

The provider layer was introduced to decouple services from their data sources.
Services previously imported JSON files directly, mixing data-access concerns
(raw types, ID resolution, mappers) with business logic (filter, sort, paginate).

The migration extracted all data-access code into a new `providers/` layer,
wired services to provider interfaces via constructor injection, and added a
factory (`providers/config.ts`) so the backend can be swapped by setting a
single environment variable.

**Scope of change**: `providers/` created entirely new; `services/` refactored.
Nothing outside those two directories was modified.

---

## Verification

### TypeScript — `npx tsc --noEmit`

Run after every phase throughout the migration. Result at merge-readiness:

```
(no output — zero errors, zero warnings)
```

### Production build — `npm run build`

```
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 13.0s
✓ TypeScript finished in 20.5s
✓ Generating static pages (43/43) in 5.4s

Route (app)
○  /                          static
●  /fixtures/[id]             SSG (24 paths)
●  /news/[slug]               SSG (12 paths)
ƒ  /fixtures                  dynamic
ƒ  /news                      dynamic
ƒ  /standings                 dynamic
ƒ  /transfers                 dynamic
```

43 pages generated. No build errors. No type errors.

---

## Commits

| Hash | Description |
|---|---|
| `ac5c8d3` | Phase 1+2: docs + provider interface contracts |
| `64f0f4f` | Phase 3: JSON provider implementations |
| `e8d5ac7` | Phase 4: inject providers into services, remove JSON imports |
| `ac32725` | Phase 5: CMS and API placeholder stubs |
| `2070bd2` | Phase 6: `providers/config.ts` factory |
| `d9b5c1c` | Phase 7: `PROVIDER_ARCHITECTURE.md` + `FUTURE_AUTOMATION.md` |

---

## Files Changed

### New — `providers/` (20 files created)

**Interfaces**
| File | Purpose |
|---|---|
| `providers/news/NewsProvider.ts` | Contract: `getAllArticles`, `getArticleBySlug`, `getAllCategories`, `getAllAuthors` |
| `providers/fixtures/FixturesProvider.ts` | Contract: `getAllFixtures`, `getFixtureById`, `getAllCompetitions`, `getAllTeams`, `getAllVenues` |
| `providers/standings/StandingsProvider.ts` | Contract + `ProviderStandingRow` / `ProviderStandingsEntry` types |
| `providers/transfers/TransfersProvider.ts` | Contract: `getAllTransfers`, `getAllClubs` |

**JSON implementations**
| File | What moved here from the service |
|---|---|
| `providers/news/JsonNewsProvider.ts` | `RawArticle`, `RawData`, `mapArticle()` |
| `providers/fixtures/JsonFixturesProvider.ts` | `RawFixture`, `RawData`, `mapFixture()` |
| `providers/standings/JsonStandingsProvider.ts` | `RawData` (JSON shape ≡ provider types — no mapper needed) |
| `providers/transfers/JsonTransfersProvider.ts` | `RawTransfer`, `RawData`, `mapTransfer()` |

**Placeholder stubs** (8 files — `CMSXxxProvider` + `APIXxxProvider` per domain)

Each method throws `new Error("ClassName.method: not implemented")` with return
type `Promise<never>`. `Promise<never>` is assignable to any `Promise<T>` via
TypeScript's bottom-type variance rule.

**Factory**
| File | Purpose |
|---|---|
| `providers/config.ts` | Reads `CONTENT_SOURCE` env var (`json`\|`cms`\|`api`, default `json`); exports `getNewsProvider()`, `getFixturesProvider()`, `getStandingsProvider()`, `getTransfersProvider()` |

### Modified — `services/` (4 files)

All business logic preserved exactly. Only the data-access layer changed.

| File | Removed | Added |
|---|---|---|
| `services/news.service.ts` | `import rawData`, `RawArticle`, `RawData`, `mapArticle()`, `this.data` | `constructor(provider: NewsProvider)`, `await this.provider.getAllArticles()` |
| `services/fixtures.service.ts` | Same pattern + `mapFixture()` | Same pattern; sort helpers re-typed to `Fixture` (same fields, just resolved) |
| `services/standings.service.ts` | `import rawData`, `RawRow`, `RawStandings`, `RawData`, `this.data` | Provider injection; `buildTable`/`findEntry`/`availableSeasonsFor` became pure functions taking explicit `(entries, clubs, competitions)` params |
| `services/transfers.service.ts` | `import rawData`, `RawTransfer`, `RawData`, `mapTransfer()` | Provider injection; club-slug filter simplified from ID lookup to direct `t.fromClub.slug === clubSlug` |

**Line counts before → after:**

| File | Before | After | Delta |
|---|---|---|---|
| `news.service.ts` | 153 | 97 | −56 |
| `fixtures.service.ts` | 224 | 150 | −74 |
| `standings.service.ts` | 317 | 248 | −69 |
| `transfers.service.ts` | 106 | 83 | −23 |
| **Total** | **800** | **578** | **−222** |

The 222 lines removed from services are the raw types and mappers that now live
in their respective `JsonXxxProvider` files.

### New — `docs/` (3 files)

| File | Contents |
|---|---|
| `docs/CURRENT_DATA_FLOW.md` | Pre-refactor baseline: 4-layer diagram, JSON coupling points, end-to-end traces |
| `docs/PROVIDER_ARCHITECTURE.md` | Reference doc for the implemented 5-layer architecture |
| `docs/FUTURE_AUTOMATION.md` | Migration roadmap: CMS, sports API, hybrid model, ISR |

---

## Files Confirmed Unchanged

The following were verified to require **zero modifications**:

| Path | Why it was isolated |
|---|---|
| `types/*.ts` | Pure type contracts — no imports from services or data |
| `lib/*.cache.ts` | Calls service interfaces only — no provider or data knowledge |
| `app/*/page.tsx` | Calls cache functions only |
| `components/**` | Receives typed props — no data access |
| `data/*.json` | Untouched source files |
| `lib/news.utils.ts` | Utility only — now used by `JsonNewsProvider` instead of the service |
| `lib/standings.utils.ts` | Zone class maps — no data dependency |
| `lib/transfers.utils.ts` | Parse/validate helpers — no data dependency |

---

## Architecture Before and After

**Before** (4 layers):
```
Pages → Cache → Services (+ raw types + mappers + JSON import) → data/*.json
```

**After** (5 layers):
```
Pages → Cache → Services (business logic only)
                    ↓ provider interface
              providers/config.ts (CONTENT_SOURCE)
                    ↓
         JsonXxxProvider | CMSXxxProvider | APIXxxProvider
                    ↓
         data/*.json    |    CMS API    |   REST API
```

---

## Notable Design Decisions

**Standings provider returns unranked rows.**
`ProviderStandingRow` has no `position`, `points`, `goalDifference`, or `zone`
fields. These are computed by `buildTable()` in the service. A real sports API
may return positions, but they may use different tiebreaker rules than the KPL.
Keeping the computation in the service ensures consistent, auditable logic.

**Singleton injection — not per-request.**
Service singletons are module-level. `getNewsProvider()` is called once at
cold start, not per request. The per-request boundary is `React.cache()` in
`lib/*.cache.ts`. This is correct for stateless providers (JSON, API with its
own caching); stateful providers would need a different wiring pattern.

**`Promise<never>` stubs — not `Promise<T>` with imports.**
Stubs only import their provider interface, not the concrete return types.
`async method(): Promise<never>` satisfies any `Promise<T>` return type.
This minimises the diff when a stub is later implemented — only the method
body changes, not the import list.

**Club-slug filter in transfers simplified.**
Before: `this.data.clubs.find(c => c.id === clubSlug)` then filter by ID.
After: `t.fromClub.slug === clubSlug` directly on the resolved `Transfer`.
The intermediate ID lookup is no longer needed because the provider returns
fully-resolved entities.

---

## How to Merge

```bash
git checkout main
git merge --no-ff feature/provider-layer -m "feat: introduce provider layer (6-phase refactor)"
```

No migration steps required for existing deployments. `CONTENT_SOURCE`
defaults to `json`, which is identical to the previous behaviour.
