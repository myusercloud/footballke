# FootballKE — Docker Guide

> All services managed by Docker Compose. Working directory: `footballke/`.

---

## Service Map

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `db` | postgres:16-alpine | 5432 | PostgreSQL database |
| `redis` | redis:7-alpine | 6379 | Cache layer |
| `backend` | footballke-backend | 4000 | NestJS REST API |
| `payload` | footballke-cms | 3001 | Payload CMS admin |
| `frontend` | footballke-frontend | 3000 | Next.js site |

---

## Starting the Stack

```bash
# Production stack (builds images then starts)
cd footballke
docker compose up --build -d

# Development stack (with hot reload)
docker compose -f docker-compose.dev.yml up --build

# Start specific service only
docker compose up db backend -d
```

---

## Stopping

```bash
# Stop without removing containers
docker compose stop

# Stop and remove containers (data volumes preserved)
docker compose down

# Stop and remove containers + volumes (destroys DB data)
docker compose down -v
```

---

## Rebuilding

```bash
# Rebuild a single service after code changes
docker compose build backend
docker compose up -d backend

# Rebuild everything
docker compose up --build -d
```

---

## Inspecting Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f payload

# Last 100 lines
docker compose logs --tail=100 backend
```

---

## Resetting the Database

```bash
# Stop services
docker compose down

# Remove volume (destroys all data)
docker volume rm footballke_db_data

# Restart and re-migrate + re-seed
docker compose up -d db
# Wait for db to be healthy, then:
docker compose run --rm backend sh -c "npx prisma migrate deploy && npm run seed"

# Start remaining services
docker compose up -d
```

---

## Environment Variables

Copy `.env.example` to `.env` in the `footballke/` directory:

```bash
cp .env.example .env
```

Key variables for the Docker stack:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

JWT_SECRET=your-32-char-secret

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

PAYLOAD_SECRET=your-payload-secret

NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=https://footballke.com

# Switch content source
CONTENT_SOURCE=api
TOURNAMENT_SOURCE=api
```

---

## Network Architecture

All services communicate on the `internal` bridge network. Only `frontend` (3000), `backend` (4000), and `payload` (3001) are mapped to the host. PostgreSQL (5432) is also exposed for local `prisma studio` access.

In production, remove the host port mappings for `backend` and `payload` and put them behind a reverse proxy (nginx/Caddy) with TLS termination.
