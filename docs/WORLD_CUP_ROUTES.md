# World Cup Hub — Route Reference

All routes live under `/world-cup`. The layout (`app/world-cup/layout.tsx`)
wraps every route with Navbar + Footer from the root layout.

---

## Routes

| Route | File | Type | generateStaticParams |
|---|---|---|---|
| `/world-cup` | `app/world-cup/page.tsx` | Static (`○`) | — |
| `/world-cup/fixtures` | `app/world-cup/fixtures/page.tsx` | Static (`○`) | — |
| `/world-cup/groups` | `app/world-cup/groups/page.tsx` | Static (`○`) | — |
| `/world-cup/news` | `app/world-cup/news/page.tsx` | Static (`○`) | — |
| `/world-cup/teams/[slug]` | `app/world-cup/teams/[slug]/page.tsx` | SSG (`●`) | All 32 teams from `getGroups()` |
| `/world-cup/players/[slug]` | `app/world-cup/players/[slug]/page.tsx` | SSG (`●`) | 6 featured players from `getFeaturedPlayers()` |

`dynamicParams = false` on both `[slug]` routes — requests for unknown slugs
return 404 from the CDN, never hitting the server.

---

## Supporting files per route

```
app/world-cup/
  layout.tsx            Navbar + Footer wrapper
  loading.tsx           WorldCupSkeleton — hub route
  error.tsx             "use client" error boundary

  page.tsx              Hub homepage

  fixtures/
    page.tsx            All fixtures, grouped by stage
    loading.tsx         FixtureListSkeleton

  groups/
    page.tsx            8-group table
    loading.tsx         8-cell skeleton grid

  news/
    page.tsx            World Cup articles (up to 20)
    loading.tsx         6-card skeleton grid

  teams/[slug]/
    page.tsx            National team profile
    loading.tsx         Skeleton
    not-found.tsx       404 with "View all groups" CTA

  players/[slug]/
    page.tsx            Player profile + stats
    loading.tsx         Skeleton
    not-found.tsx       404 with "World Cup hub" CTA
```

---

## Navigation

`TournamentNav` (`components/football/world-cup/TournamentNav.tsx`) renders
tab links. It is a `"use client"` component that calls `usePathname()` to mark
the active tab.

Tabs:
- Overview → `/world-cup`
- Fixtures → `/world-cup/fixtures`
- Groups → `/world-cup/groups`
- News → `/world-cup/news`

---

## Homepage insertion

`WorldCupHighlight` is inserted into `app/page.tsx` between the Top Stories
section and the Table section, gated by `eventConfig.worldCup.enabled`.

It fetches:
- One live/scheduled tournament fixture (`getTournamentFixtures({ status: ["live", "scheduled"], pageSize: 1 })`)
- One latest World Cup article (`getTournamentNews(1)`)

Disabling the feature (`enabled: false`) in `config/events.ts` skips both
fetches and renders nothing.

---

## JSON-LD structured data

| Route | Schema type |
|---|---|
| `/world-cup` | `SportsEvent` |
| `/world-cup/teams/[slug]` | `SportsTeam` |
| `/world-cup/players/[slug]` | `Person` |
