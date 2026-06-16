# FootballKE — Database Schema

> Prisma + PostgreSQL 16. Schema at `footballke-api/prisma/schema.prisma`.

---

## Entity Relationship Overview

```
User ──────────────────────── Article
Author ─────────────────────── Article
Category ───────────────────── Article

Team ──────────┬─ Fixture (homeTeam)
               └─ Fixture (awayTeam)
Competition ───── Fixture
Venue ─────────── Fixture

StandingClub ─── StandingRow ──── StandingEntry ──── StandingCompetition
Club ──────────── Player (clubId FK)

TransferClub ──┬─ Transfer (fromClub)
               └─ Transfer (toClub)

Tournament ────── TournamentTeam
               ── TournamentFixture
               ── TournamentStanding
               ── TournamentPlayer
               ── TopScorer
```

---

## Models

### User
Auth model for CMS/API admin accounts.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| email | String UNIQUE | Login credential |
| name | String | Display name |
| passwordHash | String | bcrypt, never returned to client |
| role | Enum (ADMIN/EDITOR/AUTHOR) | Access control |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

---

### Author / Category / Article
Content management hierarchy.

**Author** — byline records, referenced from Articles.
**Category** — slug-unique tags (match-report, transfer-news, etc.)
**Article** — has `status: DRAFT | PUBLISHED`, `deletedAt` for soft delete, `content: Json` (portable-text blocks), `relatedSlugs: String[]`.

Indexes: `slug`, `status`, `featured`, `publishedAt`, `categoryId`, `deletedAt`

---

### Team / Competition / Venue / Fixture
KPL and FKF Cup match data.

**Team** — fully denormalised snapshot (name, shortName, abbreviation, logo, colors). Slug is unique.
**Competition** — KPL, FKF Cup, etc. Season string "2025/26".
**Venue** — Nyayo, Kasarani, etc.
**Fixture** — many FK references, score/stats as JSON for flexibility.

Status lifecycle: `SCHEDULED → LIVE → HALFTIME → FULLTIME | POSTPONED`

---

### StandingClub / StandingCompetition / StandingEntry / StandingRow
Standings are deliberately NOT denormalised to avoid duplication:
- `StandingEntry` = one table for one competition × season.
- `StandingRow` = raw unranked row (no position/GD/points derived yet — the frontend service layer computes those).
- `StandingClub` is a lightweight shadow of `Club` used by the standings module only.

Zones are stored as JSON per entry so different competitions can have different promotion/relegation rules.

---

### Club / ClubVenue / Player
Full club profiles with embedded venue (ClubVenue) and squad (Player).

Player stores `clubId`, `clubSlug`, `clubName` as denormalised fields to avoid joins on every squad query.
Age is NOT stored — it's derived at read time from `dateOfBirth`.

---

### TransferClub / Transfer
Transfer window data. `fromClub` / `toClub` are separate entities from `Club` (includes foreign clubs, free agents).

---

### Tournament / TournamentTeam / TournamentFixture / TournamentStanding / TournamentPlayer / TopScorer
World Cup 2026 data model. Isolated from the KPL models to avoid schema conflicts.

`TournamentFixture` maps to the frontend `Fixture` type by having homeTeam/awayTeam embed the team shape at query time.

---

### AnalyticsEvent / Media
**AnalyticsEvent** — raw event log for custom analytics dashboards.
**Media** — uploaded file metadata with optional Cloudinary fields.

---

## Running Migrations

```bash
cd footballke-api

# Development (creates migration file)
npm run db:migrate

# Production (apply existing migrations)
npm run db:migrate:deploy

# Reset (destroys all data — dev only)
npm run db:reset

# Browse data
npm run db:studio
```

---

## Backup & Restore

```bash
# Backup
docker exec footballke-db pg_dump -U postgres footballke > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker exec -i footballke-db psql -U postgres footballke < backup_20260615_120000.sql
```
