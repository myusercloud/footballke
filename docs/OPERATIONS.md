# FootballKE — Operations Manual

Daily workflows for developers and editors.

---

## Daily Startup

```bash
# From the footballke/ directory:
docker compose up -d

# Verify all services are healthy
docker compose ps
```

Expected output: all services show `healthy`.

Access points:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/api/health
- **CMS Admin**: http://localhost:3001/admin
- **API Docs**: http://localhost:4000/api/docs

---

## Running the Stack for Development

```bash
# Terminal 1 — Database only (fast restart)
docker compose up db redis -d

# Terminal 2 — NestJS API (hot reload)
cd footballke-api
npm run dev

# Terminal 3 — Payload CMS
cd footballke-cms
npm run dev

# Terminal 4 — Next.js frontend
cd footballke
npm run dev
```

Or use the dev docker-compose:
```bash
cd footballke
docker compose -f docker-compose.dev.yml up
```

---

## Creating an Article

**Via CMS (recommended)**:
1. Open http://localhost:3001/admin
2. Articles → Create New
3. Fill title, slug, excerpt, cover image, content, author, category
4. Set Status = Published
5. Save

**Via seed script (bulk)**:
1. Add to `footballke/data/news.json`
2. `cd footballke-api && npm run seed:news`

---

## Uploading an Image

**Via CMS**:
1. Media → Create New
2. Drag-and-drop or select file
3. Add alt text
4. Save — thumbnail sizes generated automatically
5. If Cloudinary configured: `cloudinaryUrl` field populated automatically

**Via API (programmatic)**:
```bash
curl -X POST http://localhost:4000/api/uploads/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## Publishing an Article

1. Open CMS Admin → Articles
2. Find the draft (filter: Status = Draft)
3. Review content
4. Change Status to **Published**
5. Save

The frontend will serve the article within 60 seconds (Next.js ISR cache revalidation).

---

## Editing Standings

1. Open CMS Admin → Standings
2. Find the KPL 2025/26 entry
3. Update each row's raw stats (played/won/drawn/lost/GF/GA/form)
4. Save

Or update directly in DB via Prisma Studio:
```bash
cd footballke-api
npm run db:studio
```

---

## Adding a Player

1. CMS Admin → Players → Create New
2. Fill all required fields (name, slug, jerseyNumber, position, clubId, clubSlug, clubName)
3. Upload player image
4. Save

Player appears in squad list within 60 seconds.

---

## Running DB Migrations

```bash
cd footballke-api

# Development (creates new migration file, applies it)
npm run db:migrate

# Production (applies pending migrations only, no new file creation)
npm run db:migrate:deploy
```

---

## Backing Up the Database

```bash
# Create timestamped backup
docker exec footballke-db pg_dump \
  -U postgres \
  -Fc \
  footballke > "backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## Restoring the Database

```bash
# Stop services that write to the DB
docker compose stop backend payload frontend

# Restore
docker exec -i footballke-db pg_restore \
  -U postgres \
  -d footballke \
  --clean \
  < backup_20260615_120000.dump

# Restart services
docker compose start backend payload frontend
```

---

## Deploying

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild images
docker compose build

# 3. Apply DB migrations (no downtime with Prisma deploy)
docker compose run --rm backend npx prisma migrate deploy

# 4. Rolling restart (blue-green in prod)
docker compose up -d
```

---

## Switching Content Source

The content source can be switched without code changes:

```bash
# Switch frontend to use API backend
echo "CONTENT_SOURCE=api" >> footballke/.env.local
echo "TOURNAMENT_SOURCE=api" >> footballke/.env.local

# Revert to JSON files (no backend required)
echo "CONTENT_SOURCE=json" >> footballke/.env.local
echo "TOURNAMENT_SOURCE=json" >> footballke/.env.local
```

Restart the frontend after changing `CONTENT_SOURCE`:
```bash
# Dev: restart Next.js dev server
# Prod: docker compose restart frontend
```

---

## Useful Commands Reference

```bash
# View all running services
docker compose ps

# Open a shell in a container
docker compose exec backend sh
docker compose exec db psql -U postgres footballke

# Check API health
curl http://localhost:4000/api/health

# Tail API logs
docker compose logs -f backend

# Generate Prisma client after schema change
cd footballke-api && npm run db:generate

# Open Prisma Studio (DB browser)
cd footballke-api && npm run db:studio
```
