# World Cup Hub — Setup & Configuration

## Enabling / Disabling the feature

Open `config/events.ts` and set `worldCup.enabled`:

```ts
export const eventConfig = {
  worldCup: {
    enabled: true,    // ← false hides the homepage highlight and skips WC fetch
    featured: true,
    slug: "world-cup",
    label: "2026 FIFA World Cup",
    shortLabel: "World Cup",
  },
} as const;
```

Setting `enabled: false` removes the `WorldCupHighlight` section from the homepage.
The `/world-cup/*` routes remain statically built regardless — they can be blocked
at the CDN/routing layer if needed.

---

## Environment variables

| Variable | Default | Values | Effect |
|---|---|---|---|
| `TOURNAMENT_SOURCE` | `json` | `json`, `cms`, `api` | Which provider supplies tournament data |
| `CONTENT_SOURCE` | `json` | `json`, `cms`, `api` | Existing KPL data source — unaffected |

Add to `.env.local`:

```bash
TOURNAMENT_SOURCE=json   # json = reads data/world-cup/*.json (default)
```

To wire up a real API later:

```bash
TOURNAMENT_SOURCE=api
```

Then implement `APITournamentProvider` in `providers/tournaments/APITournamentProvider.ts`.

---

## Data files (`data/world-cup/`)

All JSON is loaded by `JsonTournamentProvider` at build time.

| File | Contains | Update frequency |
|---|---|---|
| `tournament.json` | Meta, host, dates, current phase | Once per phase (group → knockout → final) |
| `groups.json` | 8 groups × 4 teams | Once (after group draw) |
| `fixtures.json` | All matches — results + upcoming | After each match |
| `standings.json` | 8 group tables | After each match |
| `top-scorers.json` | Cross-team scorer leaderboard | After each match |
| `featured-players.json` | Player spotlights (6 entries) | Editorial cadence |

---

## Adding World Cup news

Tag news articles with category slug `"world-cup"` in `data/news.json`:

```json
{
  "category": { "slug": "world-cup", "name": "World Cup" },
  ...
}
```

`TournamentService.getLatestNews()` calls `newsService.getNews({ categorySlug: "world-cup" })`
so no extra configuration is needed.

---

## Swapping to a live API

1. Set `TOURNAMENT_SOURCE=api` in the deployment environment.
2. Implement all 9 provider methods in `providers/tournaments/APITournamentProvider.ts`.
3. Remove the `throw` stubs.
4. Deploy — pages automatically switch from JSON to the live API.

The `JsonTournamentProvider` remains as a fallback for local dev.
