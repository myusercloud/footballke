# FootballKE — Database Seeding

> Seeds read from `footballke/data/*.json` and insert into PostgreSQL via Prisma.
> All seeds are idempotent (upsert on slug/id) — safe to re-run.

---

## Prerequisites

1. PostgreSQL running (Docker: `docker compose up db -d`)
2. Migrations applied: `cd footballke-api && npm run db:migrate:deploy`
3. `.env` present in `footballke-api/` with `DATABASE_URL`

---

## Commands

```bash
cd footballke-api

# Run all seeds (in dependency order)
npm run seed

# Seed individual domains
npm run seed:news        # Categories → Authors → Articles
npm run seed:clubs       # ClubVenues → Clubs
npm run seed:players     # Requires clubs seeded first
npm run seed:fixtures    # Teams → Competitions → Venues → Fixtures
npm run seed:standings   # StandingClubs → StandingCompetitions → StandingEntries → StandingRows
npm run seed:tournaments # Tournament → TournamentTeams → Standings → Fixtures → TopScorers → Players
npm run seed:transfers   # TransferClubs → Transfers
```

---

## Dependency Order

```
seed:news
seed:clubs
  └─ seed:players (requires clubs)
seed:fixtures
seed:standings
seed:tournaments
seed:transfers
```

When running `npm run seed`, this order is enforced automatically.

---

## What Gets Seeded

| Seed | Source File | Records |
|------|-------------|---------|
| `seed:news` | `data/news.json` | 6 categories, 5 authors, ~10 articles |
| `seed:clubs` | `data/clubs.json` | 18 clubs + venues |
| `seed:players` | `data/players.json` | ~180 players |
| `seed:fixtures` | `data/fixtures.json` | 18 teams, 2 competitions, ~20 fixtures |
| `seed:standings` | `data/standings.json` | 1 entry, 18 rows |
| `seed:tournaments` | `data/world-cup/*.json` | 1 tournament, 32 teams, 48 fixtures |
| `seed:transfers` | `data/transfers.json` | 20 clubs, ~30 transfers |

---

## Rollback

Seeds use upsert — they do not rollback automatically. To reset to a clean state:

```bash
cd footballke-api

# WARNING: destroys all data
npm run db:reset

# Then re-seed
npm run seed
```

---

## ID Preservation

Seeds preserve the original string IDs from the JSON files (e.g. `"gor-mahia"`, `"art-1"`). This ensures:
- URLs remain stable during migration
- Cross-references (e.g. `clubId` on `Player`) resolve correctly

---

## Adding New Data

To add content before the CMS is operational:

1. Add entries to the relevant `data/*.json` file following the existing shape.
2. Run `npm run seed:<domain>`.
3. The API and frontend will serve the new content immediately.

Once the CMS is live, add content through the Payload admin panel at `http://localhost:3001/admin` instead of editing JSON files directly.
