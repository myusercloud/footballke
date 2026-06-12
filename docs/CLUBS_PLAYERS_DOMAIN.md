# Clubs & Players — Domain Design

> **Phase 1 — Domain Analysis**
> Status: pre-implementation specification.
> No code has been modified. This document drives Phases 2–15.

---

## 1. Why These Are First-Class Entities

Every piece of content on FootballKE references clubs or players:

- A **fixture** is between two clubs, played by players.
- A **standing** is a club's position in a competition.
- A **transfer** moves a player between clubs.
- A **news article** is about a club, a player, or a match involving both.

Today, clubs exist as three separate lightweight shadows embedded in other
modules (`Team` in fixtures, `Club` in standings, `TransferClub` in transfers).
Players exist only as thin `TransferPlayer` structs with no slug, no id, no page.

Promoting them to first-class domain entities means:

- Every club gets a canonical page at `/clubs/[slug]`
- Every player gets a canonical page at `/players/[slug]`
- Cross-module lookups use stable IDs that are already consistent across all JSON files
- CMS / API migration happens in one place (the provider), not scattered across four modules

---

## 2. Entity Definitions

### Club

The authoritative representation of a football club. All other modules that
reference a club carry a lightweight subset of these fields.

```
Club
├── Identity
│   ├── id              "club-gor-mahia"        matches Team.id in fixtures, Club.id in standings
│   ├── slug            "gor-mahia"             URL-safe, permanent
│   ├── name            "Gor Mahia FC"
│   ├── shortName       "Gor Mahia"
│   └── abbreviation    "GOR"
│
├── Visual
│   ├── logo            path or CDN URL
│   ├── colors          { primary, secondary }  CSS hex
│   └── venue           { id, name, city, capacity }
│
├── Metadata
│   ├── founded         1968                    year
│   ├── city            "Nairobi"
│   ├── country         "Kenya"
│   ├── description     plain text bio
│   └── social          { twitter, facebook, instagram, website }
│
├── Achievements        string[]                ["KPL Champions 2024", …]
│
├── Stats (current season)
│   ├── position        number
│   ├── played          number
│   ├── won / drawn / lost
│   ├── goalsFor / goalsAgainst / goalDifference
│   ├── points          number
│   └── form            string[]                ["W","W","D","L","W"]
│
└── Search
    ├── searchableName      "Gor Mahia FC"
    ├── searchableKeywords  ["Green Army", "K'Ogalo", "Gor", …]
    └── searchableSlug      "gor-mahia"
```

### Player

A football player, currently contracted to a club.

```
Player
├── Identity
│   ├── id              "player-john-macharia-001"
│   ├── slug            "john-macharia"
│   ├── name            "John Macharia"
│   └── jerseyNumber    number
│
├── Physical
│   ├── position        Position enum
│   ├── secondaryPosition  Position | null
│   ├── nationality     Nationality
│   ├── dateOfBirth     "1998-04-12"   ISO date
│   ├── age             number         derived at read time
│   ├── height          number         centimetres
│   └── preferredFoot   "right" | "left" | "both"
│
├── Club
│   ├── clubId          foreign key → Club.id
│   ├── clubSlug        denormalised for URL construction
│   └── contractUntil   "2027-06-30" | null
│
├── Image              path or CDN URL
│
├── Stats (current season)
│   ├── appearances     number
│   ├── goals           number
│   ├── assists         number
│   ├── yellowCards     number
│   ├── redCards        number
│   └── minutesPlayed   number
│
├── Bio                 string         short player biography
│
└── Search
    ├── searchableName      "John Macharia"
    ├── searchableKeywords  ["Macharia", "Gor Mahia", "striker", …]
    └── searchableSlug      "john-macharia"
```

### Position (enum)

```
Goalkeeper
Defender → Centre-Back | Left-Back | Right-Back
Midfielder → Defensive | Central | Attacking | Wide
Forward → Striker | Second Striker | Winger
```

### Nationality

```
Nationality
├── name     "Kenyan"
├── code     "KE"         ISO 3166-1 alpha-2
└── flag     path or CDN URL
```

---

## 3. Relationships

```
Club ──── owns ──────────────────── Player[] (squad)
  │
  ├──── participates in ─────────── Fixture[] (via homeTeam.id / awayTeam.id)
  │
  ├──── ranked in ──────────────── StandingRow (via club.id)
  │
  ├──── involved in ─────────────── Transfer[] (via fromClub.slug / toClub.slug)
  │
  └──── covered by ──────────────── Article[] (via tags[] containing club slug)


Player ── belongs to ─────────────── Club (via clubId)
  │
  ├──── subject of ──────────────── Transfer[] (via player.name, future: player.id)
  │
  └──── covered by ──────────────── Article[] (via tags[] containing player slug)
```

### Cross-module ID alignment (current state)

The IDs in existing JSON files are already consistent:

| Module | Field | Example value |
|---|---|---|
| `fixtures.json` | `homeTeam.id` | `"team-gor-mahia"` |
| `standings.json` | `clubs[].id` | `"team-gor-mahia"` |
| `transfers.json` | `fromClub.slug` | `"gor-mahia"` |
| **new** `clubs.json` | `club.id` | `"team-gor-mahia"` |
| **new** `players.json` | `player.clubId` | `"team-gor-mahia"` |

No migration of existing JSON files is needed. Cross-referencing works today.

### Ownership semantics

- A `Player` has **one current club** (`clubId`). Historical clubs are not
  modelled in Phase 1 — transfer history lives in `transfers.json`.
- A `Club` does not embed its squad in its own JSON. Players reference their club
  by ID. The service assembles the squad on demand (`getPlayersByClub(slug)`).
- `Article.tags[]` contains slugs. A tag matching a club or player slug creates
  the implicit news ↔ entity relationship without foreign keys.

---

## 4. Lightweight Shadows (existing types)

Three existing types carry a subset of `Club` fields. They are NOT replaced —
they remain the shape those modules pass to their own UI:

| Type | Lives in | Fields | Used by |
|---|---|---|---|
| `Team` | `types/fixture.ts` | id, name, shortName, abbreviation, slug, logo, colors | Fixture cards, scoreboards |
| `Club` | `types/standings.ts` | id, name, shortName, slug, logo, colors | Standings table rows |
| `TransferClub` | `types/transfer.ts` | id, name, shortName, slug, country | Transfer cards |

When a real API arrives, the fixture/standings/transfers providers can derive
these lightweight types from the canonical `Club` data. Until then, they remain
independent JSON entries that share consistent IDs.

---

## 5. Provider Architecture

Following the existing flat convention (`providers/fixtures/`, `providers/news/`),
**not** the `providers/content/clubs/` path from the spec, which would introduce
an inconsistent nesting level.

```
providers/
  clubs/
    ClubProvider.ts          interface
    JsonClubProvider.ts      reads data/clubs.json
    CMSClubProvider.ts       stub — throws "not implemented"
    APIClubProvider.ts       stub — throws "not implemented"
  players/
    PlayerProvider.ts        interface
    JsonPlayerProvider.ts    reads data/players.json
    CMSPlayerProvider.ts     stub
    APIPlayerProvider.ts     stub
```

`providers/config.ts` gains two new factory functions:
`getClubProvider()` and `getPlayerProvider()`, gated by the existing
`CONTENT_SOURCE` env var.

### Provider contract (clubs)

```ts
interface ClubProvider {
  getAllClubs(): Promise<Club[]>
  getClubBySlug(slug: string): Promise<Club | null>
}
```

### Provider contract (players)

```ts
interface PlayerProvider {
  getAllPlayers(): Promise<Player[]>
  getPlayerBySlug(slug: string): Promise<Player | null>
  getPlayersByClub(clubSlug: string): Promise<Player[]>
}
```

Providers return fully resolved, UI-ready entities.
No filtering, sorting, or pagination in the provider layer.

---

## 6. Service Layer

Services sit above providers and handle all filtering, sorting, pagination, and
cross-domain lookups.

```
services/club.service.ts
  getClubs(params?)           paginated list, optional search/filter
  getClubBySlug(slug)         single club or null
  getFeaturedClubs(limit?)    curated or points-ranked
  getRelatedClubs(slug, limit?) same city/competition

services/player.service.ts
  getPlayers(params?)         paginated list
  getPlayerBySlug(slug)       single player or null
  getPlayersByClub(clubSlug)  squad
  getFeaturedPlayers(limit?)  top scorers / notable players
  getRelatedPlayers(slug, limit?) same club or position
```

Services never import JSON directly. They receive a provider via constructor.

---

## 7. Page Routes

```
app/clubs/
  page.tsx              /clubs              all clubs grid
  [slug]/
    page.tsx            /clubs/gor-mahia    club profile

app/players/
  [slug]/
    page.tsx            /players/john-macharia   player profile

(no /players index page — players are discovered via their club)
```

---

## 8. Component Map

```
components/football/clubs/
  ClubCard               compact card for grid
  ClubGrid               responsive grid of ClubCards
  ClubHeader             hero: logo, name, colors, stadium
  ClubStats              points, GD, form strip
  ClubAchievements       titles and honours list
  ClubFixturesPreview    next/recent fixtures widget
  ClubNewsPreview        latest articles mentioning the club
  SquadList              full squad grouped by position
  PlayerPreviewCard      compact player card inside SquadList
  ClubSkeleton           loading state

components/football/players/
  PlayerCard             compact card
  PlayerProfileHeader    hero: photo, name, number, position, club
  PlayerStatsCard        season stats grid
  PlayerBio              bio text block
  PlayerCareerInfo       age, height, foot, nationality
  PlayerRelatedNews      articles mentioning this player
  PlayerSkeleton         loading state
```

---

## 9. Data File Structure

### `data/clubs.json`

```json
{
  "clubs": [
    {
      "id": "team-gor-mahia",
      "slug": "gor-mahia",
      "name": "Gor Mahia FC",
      "shortName": "Gor Mahia",
      "abbreviation": "GOR",
      "founded": 1968,
      "city": "Nairobi",
      "country": "Kenya",
      "logo": "/clubs/gor-mahia.svg",
      "colors": { "primary": "#006B2D", "secondary": "#FFFFFF" },
      "venue": { "id": "venue-kasarani", "name": "Kasarani Stadium", "city": "Nairobi", "capacity": 60000 },
      "description": "...",
      "achievements": ["KPL Champions 2024", "..."],
      "social": { "twitter": "...", "facebook": "...", "instagram": "...", "website": "..." },
      "stats": { "position": 1, "played": 22, "won": 14, "drawn": 5, "lost": 3, ... },
      "searchableName": "Gor Mahia FC",
      "searchableKeywords": ["Green Army", "K'Ogalo", "GOR"],
      "searchableSlug": "gor-mahia"
    }
  ]
}
```

### `data/players.json`

```json
{
  "players": [
    {
      "id": "player-nicholas-kipkirui",
      "slug": "nicholas-kipkirui",
      "name": "Nicholas Kipkirui",
      "jerseyNumber": 9,
      "position": "Striker",
      "secondaryPosition": null,
      "nationality": { "name": "Kenyan", "code": "KE", "flag": "/flags/ke.svg" },
      "dateOfBirth": "1994-08-15",
      "height": 178,
      "preferredFoot": "right",
      "clubId": "team-gor-mahia",
      "clubSlug": "gor-mahia",
      "contractUntil": "2027-06-30",
      "image": "/players/nicholas-kipkirui.jpg",
      "stats": { "appearances": 20, "goals": 14, "assists": 4, "yellowCards": 3, "redCards": 0, "minutesPlayed": 1710 },
      "bio": "...",
      "searchableName": "Nicholas Kipkirui",
      "searchableKeywords": ["Kipkirui", "Gor Mahia", "striker", "Kenya"],
      "searchableSlug": "nicholas-kipkirui"
    }
  ]
}
```

---

## 10. Future Scalability

### CMS migration

`CMSClubProvider.getAllClubs()` fetches from a headless CMS.
Zero changes to services, components, or pages.

### Sports API migration

`APIClubProvider` fetches from a sports data provider (e.g. API-Football,
SportMonks) and maps the external schema to `Club`. The mapping lives entirely
in the provider — no leakage into the service layer.

### Player career history

Add `career: CareerEntry[]` to `Player` where each entry has
`{ clubId, clubName, from, to, appearances, goals }`.
The provider contract adds `getPlayerCareer(slug)`.

### Squad management

When transfers are confirmed, `player.clubId` and `player.clubSlug` are updated.
The transfer record in `transfers.json` provides the history.

### Many-to-many competition participation

A player may appear for multiple clubs across cup and league competitions.
Add `competitions: string[]` (competition slugs) to `Player.stats` when needed.

### Search

`searchableName`, `searchableKeywords`, and `searchableSlug` are present from
Phase 1. A future search provider indexes these fields without requiring a
schema change.

---

## 11. Architecture Consistency Checklist

| Rule | Approach |
|---|---|
| Services never import JSON | Provider receives data; service applies logic |
| Providers return fully resolved types | No raw IDs exposed to services or UI |
| Stubs throw, not return empty | `CMSClubProvider` throws "not implemented" |
| No `any` in type system | All types are explicit |
| `CONTENT_SOURCE` controls provider | `getClubProvider()` in `providers/config.ts` |
| Server Components by default | Pages are `async` functions; components are Server unless event-driven |
| `"use client"` only for interactivity | Skeleton states, filter dropdowns, click handlers |

---

## 12. Implementation Status (Phases 2–15)

All phases complete. `npm run build` passes with 54 static/dynamic routes, zero type errors.

### Delivered files

**Data**
- `data/clubs.json` — 10 KPL clubs with full season stats
- `data/players.json` — 150 players (15 per club), `age` excluded (derived at read time)

**Types**
- `types/club.ts` — `Club`, `ClubStats`, `ClubSocial`, `IClubService`, `GetClubsParams`, `ClubResponse`
- `types/player.ts` — `Player`, `Position`, `PositionCategory`, `IPlayerService`, `GetPlayersParams`, `PlayerResponse`

**Providers**
- `providers/clubs/ClubProvider.ts` — interface
- `providers/clubs/JsonClubProvider.ts` — active (null-stripping via `mapSocial`)
- `providers/clubs/CMSClubProvider.ts` — stub
- `providers/clubs/APIClubProvider.ts` — stub
- `providers/players/PlayerProvider.ts` — interface
- `providers/players/JsonPlayerProvider.ts` — active (age computed via `computeAge`)
- `providers/players/CMSPlayerProvider.ts` — stub
- `providers/players/APIPlayerProvider.ts` — stub
- `providers/config.ts` — updated with `getClubProvider()` and `getPlayerProvider()`

**Services**
- `services/club.service.ts` — `getClubs`, `getClubBySlug`, `getFeaturedClubs`, `getRelatedClubs`; singleton
- `services/player.service.ts` — `getPlayers`, `getPlayerBySlug`, `getPlayersByClub`, `getFeaturedPlayers`, `getRelatedPlayers`; singleton

**Cache layer**
- `lib/clubs.cache.ts` — React `cache()` wrappers for all service methods
- `lib/players.cache.ts` — React `cache()` wrappers
- `lib/fixtures.cache.ts` — added `getClubFixtures`

**Club components** (`components/football/clubs/`)
- `ClubCard`, `ClubGrid`, `ClubHeader`, `ClubStats`, `ClubAchievements`
- `ClubFixturesPreview`, `ClubNewsPreview`, `SquadList`, `PlayerPreviewCard`, `ClubSkeleton`

**Player components** (`components/football/players/`)
- `PlayerCard`, `PlayerProfileHeader`, `PlayerStatsCard`, `PlayerBio`
- `PlayerCareerInfo`, `PlayerRelatedNews`, `PlayerSkeleton`

**Routes**
- `app/clubs/layout.tsx`, `app/clubs/loading.tsx`, `app/clubs/error.tsx`
- `app/clubs/page.tsx` — SSG clubs list
- `app/clubs/[slug]/loading.tsx`, `app/clubs/[slug]/not-found.tsx`
- `app/clubs/[slug]/page.tsx` — SSG club profile (`dynamicParams = false`)
- `app/players/layout.tsx`
- `app/players/[slug]/loading.tsx`, `app/players/[slug]/not-found.tsx`
- `app/players/[slug]/page.tsx` — dynamic player profile with JSON-LD

### Known gaps (future work)
- Club-specific news: news module has no `clubSlug` filter; `ClubNewsPreview` receives `[]` until that's wired
- Player images: placeholders use jersey-number circles; real images need Cloudinary
- Player search UI: searchable fields are indexed; no search input component yet
- `/players` index page: players discovered via club squad lists only
