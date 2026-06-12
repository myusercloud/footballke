# World Cup Tournament Hub — Architecture Design

> **Phase 1 — Domain Analysis**
> Status: pre-implementation specification.
> No code has been modified. This document drives Phases 2–15.

---

## 1. Goal

Add a dedicated `/world-cup` tournament hub to FootballKE without modifying the
existing KPL homepage or breaking any existing route. The hub covers match
fixtures, group standings, top scorers, featured players, and World Cup news.

The architecture must support future tournaments (AFCON, CHAN, CECAFA) by
configuration change, not code change.

---

## 2. Reuse Analysis

### Modules reused without modification

| Module | How it is reused |
|---|---|
| `INewsService` / `newsService` | Called by tournament service: `getNews({ categorySlug: "world-cup" })`. World Cup articles exist in `data/news.json` with the right tag. No service changes. |
| `Fixture` type | World Cup matches use the existing `Fixture` shape verbatim. Tournament fixtures live in `data/world-cup/fixtures.json`; the tournament provider maps them to `Fixture` objects. |
| `FixtureCard`, `FeaturedFixture`, `ScoreBoard`, `FormBadges`, `MatchStatus` | Competition-agnostic components — they receive `Fixture` and render regardless of competition name. |
| `NewsCard`, `NewsGrid`, `HeroArticle` | Competition-agnostic — receive `Article[]` and render. |
| `Article` type | World Cup news articles use the existing `Article` shape. |
| Analytics `track()` + `events` factory | New World Cup event types added to the union in `lib/analytics/events.ts`. |

### Why World Cup data is NOT merged into existing JSON files

`data/fixtures.json` and `data/standings.json` hold **KPL** data.
Mixing World Cup entries would:

1. Break the KPL fixtures page default view (World Cup matches would appear unless filtered out)
2. Make it impossible to swap World Cup data to a live API without touching KPL files
3. Require the existing fixture provider to handle a structurally different competition (knockout brackets, group letters) it was not designed for

**Decision**: World Cup gets its own `data/world-cup/` directory. The tournament
provider reads these files. Existing services remain untouched.

### Modules that are tournament-specific (new code required)

| Concept | Why a new type / service is needed |
|---|---|
| `Tournament` | Host, dates, current phase (group/knockout/final), emblem — no equivalent exists |
| `TournamentGroup` | Ordered A–H groups, each with 4 teams and a group-standings table — not expressible as a flat KPL standings table |
| `KnockoutRound` | Bracket structure (R16 → QF → SF → Final) with team1/team2 slots — not a KPL matchday |
| `TournamentTeam` | National team: flag, confederation, FIFA ranking — not a KPL `Club` |
| `TournamentPlayer` | Tournament-scoped stats (goals/assists in this tournament only), national team association |
| `TopScorer` | Cross-team ranked leaderboard — no equivalent in `IPlayerService` |
| `TournamentStanding` | Group table row with `status: "qualified" | "eliminated" | "tbd"` — the KPL standing row has `zone` instead |

---

## 3. Layer Map

```
app/world-cup/
  layout.tsx                     shared layout (Navbar + Footer)
  loading.tsx                    route-level Suspense fallback
  error.tsx                      error boundary
  page.tsx                       /world-cup  — hub homepage
  fixtures/
    page.tsx                     /world-cup/fixtures
  groups/
    page.tsx                     /world-cup/groups
  news/
    page.tsx                     /world-cup/news
  teams/
    [slug]/
      page.tsx                   /world-cup/teams/[slug]
  players/
    [slug]/
      page.tsx                   /world-cup/players/[slug]
          ↓
lib/tournament.cache.ts          React cache() wrappers (dedup within render pass)
          ↓
services/tournament.service.ts
  getTournament()
  getGroups()
  getKnockoutRounds()
  getFixtures(params?)
  getGroupStandings(groupLetter?)
  getTopScorers(limit?)
  getFeaturedPlayers(limit?)
  getTeamBySlug(slug)
  getPlayerBySlug(slug)
  getLatestNews(limit?)          ← calls newsService (existing)
          ↓
providers/tournaments/
  TournamentProvider.ts          interface
  JsonTournamentProvider.ts      reads data/world-cup/*.json  (active)
  CMSTournamentProvider.ts       stub — throws "not implemented"
  APITournamentProvider.ts       stub — throws "not implemented"
          ↓
providers/config.ts              getTournamentProvider() factory added
          ↓
data/world-cup/
  tournament.json                meta, host, dates, phase, groups A–H
  fixtures.json                  48 group + 16 knockout placeholders
  groups.json                    8 groups × 4 teams
  standings.json                 8 group tables
  top-scorers.json               cross-team scorer leaderboard
  featured-players.json          player spotlights (6–8 entries)
```

---

## 4. Type System (`types/tournament.ts`)

### New types (not covered by existing modules)

```
Tournament
├── id, slug, name, shortName
├── host: { country, city, venues[] }
├── dates: { start, end }
├── currentPhase: TournamentStage
├── emblem: string             path or CDN URL
├── groups: TournamentGroup[]
├── featured: boolean

TournamentStage
  "group" | "round-of-16" | "quarter-final" | "semi-final" | "final"

TournamentGroup
├── letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"
├── teams: TournamentTeam[]

TournamentTeam
├── id, slug, name, shortName, abbreviation
├── flag: string               path or CDN URL
├── colors: { primary, secondary }
├── confederation: "CAF" | "UEFA" | "CONMEBOL" | "CONCACAF" | "AFC" | "OFC"
├── fifaRanking: number
├── qualified: boolean

TournamentPlayer
├── id, slug, name
├── team: TournamentTeam
├── position: Position          reuses types/player.ts
├── jerseyNumber: number
├── nationality: Nationality    reuses types/player.ts
├── dateOfBirth: string
├── age: number                 derived at read time
├── stats: TournamentPlayerStats

TournamentPlayerStats
├── appearances, goals, assists
├── yellowCards, redCards, minutesPlayed
├── cleanSheets?               GKs only

TopScorer
├── rank: number
├── player: { slug, name, team: TournamentTeam }
├── goals: number
├── assists: number
├── appearances: number

TournamentStanding (group table row)
├── position: number
├── team: TournamentTeam
├── played, won, drawn, lost
├── goalsFor, goalsAgainst, goalDifference, points
├── status: "qualified" | "eliminated" | "tbd"

GroupStandingsTable
├── group: TournamentGroup
├── rows: TournamentStanding[]

KnockoutMatch
├── id, stage: TournamentStage
├── team1: TournamentTeam | null    null = TBD
├── team2: TournamentTeam | null
├── score?: Score                   reuses types/fixture.ts
├── winner?: TournamentTeam
├── kickoff?: string
├── venue?: string
├── status: MatchStatus             reuses types/fixture.ts

KnockoutRound
├── stage: TournamentStage
├── matches: KnockoutMatch[]
```

### Types NOT duplicated — borrowed as-is

- `Fixture` (`types/fixture.ts`) — tournament match objects (group stage + knockout) use this shape verbatim via the tournament provider mapping
- `Article` (`types/news.ts`) — World Cup news articles
- `Position`, `Nationality` (`types/player.ts`) — reused on `TournamentPlayer`
- `Score`, `MatchStatus` (`types/fixture.ts`) — reused on `KnockoutMatch`

---

## 5. Data Files (`data/world-cup/`)

### `tournament.json`
Tournament metadata: id, name, host country/cities, start/end dates, current
phase, group letters array, emblem path, featured flag.

### `fixtures.json`
All 64 matches (48 group stage + 16 knockout). Each entry maps to the
`Fixture` shape: homeTeam/awayTeam (as `TournamentTeam` IDs resolved by
provider), competition, venue, kickoff, status, score. Group fixtures populate
first; knockout slots start as `status: "scheduled"` with TBD teams.

### `groups.json`
Array of 8 groups, each with letter and 4 `TournamentTeam` objects.

### `standings.json`
8 group tables. Each: group letter + array of `TournamentStanding` rows.
Updated as group stage progresses.

### `top-scorers.json`
Ordered array of `TopScorer` objects. Seeded with realistic player names
and stats for the current tournament.

### `featured-players.json`
6–8 `TournamentPlayer` spotlights chosen editorially.

---

## 6. Provider Interface (`providers/tournaments/TournamentProvider.ts`)

```ts
interface TournamentProvider {
  getTournament(): Promise<Tournament>
  getGroups(): Promise<TournamentGroup[]>
  getFixtures(): Promise<Fixture[]>
  getGroupStandings(): Promise<GroupStandingsTable[]>
  getTopScorers(): Promise<TopScorer[]>
  getFeaturedPlayers(): Promise<TournamentPlayer[]>
  getTeamBySlug(slug: string): Promise<TournamentTeam | null>
  getPlayerBySlug(slug: string): Promise<TournamentPlayer | null>
  getKnockoutRounds(): Promise<KnockoutRound[]>
}
```

`JsonTournamentProvider` reads all `data/world-cup/*.json` files and maps them
to these types at construction time (same pattern as `JsonClubProvider`).

`CMSTournamentProvider` and `APITournamentProvider` throw `"not implemented"`.

`providers/config.ts` gains `getTournamentProvider()` gated by
`TOURNAMENT_SOURCE` env var (separate from `CONTENT_SOURCE` so KPL and
tournament backends can be switched independently).

---

## 7. Service (`services/tournament.service.ts`)

```ts
class TournamentService implements ITournamentService {
  constructor(private readonly provider: TournamentProvider) {}

  getTournament()
  getGroups()
  getKnockoutRounds()
  getFixtures(params?: GetTournamentFixturesParams)
    // filter by group, stage, teamSlug, status
  getGroupStandings(groupLetter?: string)
    // single group or all 8
  getTopScorers(limit = 10)
  getFeaturedPlayers(limit = 8)
  getTeamBySlug(slug: string)
  getPlayerBySlug(slug: string)
  getLatestNews(limit = 5)
    // delegates to newsService.getNews({ categorySlug: "world-cup" })
}
```

The service is the only layer that calls `newsService` — that call lives here,
not in the provider and not in the page. This satisfies "do not duplicate news
logic": news retrieval uses the same path it always has.

---

## 8. Event Configuration (`config/events.ts`)

```ts
export const eventConfig = {
  worldCup: {
    enabled: true,     // show World Cup section on homepage
    featured: true,    // promote to top of homepage section order
    slug: "world-cup", // route segment
    label: "2026 FIFA World Cup",
  },
  // Future:
  // afcon: { enabled: false, ... }
  // chan: { enabled: false, ... }
  // cecafa: { enabled: false, ... }
} as const;
```

Homepage imports `eventConfig.worldCup.enabled`. If `false`, the highlight
section renders `null`. No other code changes required to disable.

---

## 9. Homepage Integration (Phase 9)

A single `WorldCupHighlight` section added to the existing homepage, gated by
`eventConfig.worldCup.enabled`. It sits between existing sections and shows:
- Featured match card (reuses `FeaturedFixture`)
- One recent World Cup news article (reuses `NewsCard`)
- CTA button → `/world-cup`

The existing homepage layout, data fetching, and all existing sections are
unchanged. The new section is an additive block — it can be disabled by
setting `enabled: false` in `config/events.ts`.

---

## 10. Analytics (Phase 11)

New event types added to `lib/analytics/events.ts`:

```ts
"world_cup_view"     { tournament_slug: string }
"group_open"         { group_letter: string }
"fixture_open"       { fixture_id: string; stage: TournamentStage }  ← extends existing
"player_open"        { player_slug: string; team_slug: string }
"team_open"          { team_slug: string; group_letter: string }
"news_open"          { article_slug: string; source: "world-cup-hub" }
"countdown_click"    { tournament_slug: string; days_remaining: number }
```

Tournament events use the existing `track()` function — no analytics
infrastructure changes.

---

## 11. Routes and Pages

| Route | Type | Content |
|---|---|---|
| `/world-cup` | SSG | Hub: hero, featured match, groups summary, top scorers, featured players, latest news, countdown |
| `/world-cup/fixtures` | SSG | Full fixture list filterable by group / stage |
| `/world-cup/groups` | SSG | All 8 group tables |
| `/world-cup/news` | Dynamic | World Cup articles from newsService — inherits news module pagination |
| `/world-cup/teams/[slug]` | SSG (generateStaticParams) | National team profile |
| `/world-cup/players/[slug]` | SSG (generateStaticParams) | Player profile |

---

## 12. Components (`components/football/world-cup/`)

| Component | Receives | Notes |
|---|---|---|
| `WorldCupHero` | `Tournament` | Banner with emblem, host, dates, current phase |
| `TournamentNav` | current path | Tab bar: Fixtures / Groups / Standings / Players / News |
| `FeaturedMatch` | `Fixture` | Reuses `FeaturedFixture` from fixtures module |
| `GroupCard` | `GroupStandingsTable` | Compact table: 4 rows, team, P/W/D/L/GD/Pts, status badge |
| `GroupStandings` | `GroupStandingsTable[]` | Full 8-group layout for `/world-cup/groups` |
| `TopScorers` | `TopScorer[]` | Ranked leaderboard with flag, goals, assists |
| `PlayerSpotlight` | `TournamentPlayer[]` | Grid of player cards |
| `TournamentNews` | `Article[]` | Thin wrapper around existing `NewsCard` |
| `Countdown` | `Tournament` | Client component — days/hours/minutes to kick-off |
| `KnockoutPreview` | `KnockoutRound[]` | Bracket tree — placeholder until knockout begins |
| `WorldCupSkeleton` | — | animate-pulse skeleton for the hub homepage |
| `WorldCupHighlight` | `Fixture`, `Article` | Homepage insertion (Phase 9) |

---

## 13. Consistency with existing architecture

| Rule | How it is applied |
|---|---|
| Services never import JSON | `JsonTournamentProvider` reads files; service receives provider via constructor |
| Providers return fully resolved types | No raw IDs leak past the provider boundary |
| Stubs throw, not return empty | `CMSTournamentProvider` throws `"not implemented"` |
| No `any` | All mapped types are explicit |
| `TOURNAMENT_SOURCE` controls provider | `getTournamentProvider()` in `providers/config.ts` |
| Server Components by default | All pages are async; `Countdown` is the only `"use client"` component (needs `Date.now()`) |
| React `cache()` for deduplication | `lib/tournament.cache.ts` wraps all service methods |
| Analytics calls stay out of data layer | Events fired only in UI components, never in services or providers |

---

## 14. What is NOT built

- Authentication or user accounts
- Admin or editorial interfaces
- Live score polling (status changes require a data update, not a socket)
- Full bracket visualisation (placeholder brackets only — requires complete knockout data)
- Team vs team historical records
- Player transfer links (tournament players are not KPL players; no transfer module tie-in)
