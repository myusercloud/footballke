# Docker — FootballKE

## Overview

Two Docker environments are provided:

| Mode | File | Command |
|---|---|---|
| Development | `Dockerfile.dev` + `docker-compose.dev.yml` | `docker compose -f docker-compose.dev.yml up` |
| Production | `Dockerfile` + `docker-compose.yml` | `docker compose up` or `docker run` |

---

## Prerequisites

- Docker Desktop ≥ 4.x (or Docker Engine + Compose Plugin ≥ 2.x)
- Node.js is **not** required on the host — it runs inside the container

---

## Development

### First run

```bash
# Start with hot reload
docker compose -f docker-compose.dev.yml up

# Or rebuild the image first (after adding/removing packages)
docker compose -f docker-compose.dev.yml up --build
```

The app is available at **http://localhost:3000**.

Changes to any file under the project root are reflected immediately — no restart required.

### How hot reload works

The source tree is bind-mounted into the container at `/app`. Next.js watches for file changes via inotify (Linux) or polling. `node_modules` lives in a named volume (`nm`) so it is never replaced by the host's copy.

### Adding or removing packages

Any `npm install` / `npm uninstall` must be re-run inside the container, not on the host, because the Linux-built modules live in the `nm` named volume.

```bash
# Option A — run npm inside the running container
docker compose -f docker-compose.dev.yml exec frontend npm install <package>

# Option B — rebuild the image (re-runs npm ci from scratch)
docker compose -f docker-compose.dev.yml up --build
```

### Stopping

```bash
docker compose -f docker-compose.dev.yml down
```

Named volumes (`nm`, `next_cache`) persist between restarts. To wipe them:

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Production

### Build the image

```bash
docker build -t footballke-frontend .
```

Pass build-time public variables with `--build-arg` (they are inlined into the JS bundle):

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://footballke.com \
  --build-arg NEXT_PUBLIC_API_URL=https://api.footballke.com \
  -t footballke-frontend .
```

### Run the image

```bash
docker run -p 3000:3000 footballke-frontend
```

### Run with Docker Compose (recommended)

```bash
# Copy and fill in env values
cp .env.example .env.production

docker compose up -d
```

### Check container health

```bash
docker compose ps          # Health column shows "healthy" / "starting" / "unhealthy"
docker inspect footballke-frontend --format='{{.State.Health.Status}}'
```

---

## Environment variables

See `.env.example` for all supported variables and their descriptions.

### Local dev
Create `.env` or `.env.local` at the project root. Both files are loaded automatically by `docker-compose.dev.yml` when present.

### Production
Create `.env.production`. Loaded by `docker-compose.yml`.

> **Important:** `NEXT_PUBLIC_*` variables are inlined at **build time**. If you change them, you must rebuild the image — injecting them at container start has no effect.

### How the three environments differ

| Variable | Local dev | Production Docker |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://footballke.com` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | `https://api.footballke.com` |
| `NODE_ENV` | `development` (set by compose) | `production` (set in Dockerfile) |

---

## Logs

```bash
# Dev
docker compose -f docker-compose.dev.yml logs -f

# Production
docker compose logs -f frontend
```

---

## Rebuild process

| Situation | Command |
|---|---|
| Source code changed | No action — live via volume (dev) or rebuild image (prod) |
| `package.json` changed | `docker compose -f docker-compose.dev.yml up --build` |
| `next.config.ts` changed | Restart container (dev) or rebuild image (prod) |
| Environment variable changed | Rebuild image (NEXT_PUBLIC_*) or restart container (server-only) |

---

## Common issues

### Hot reload not working on Windows/WSL2

Windows filesystem events sometimes don't propagate into the container. Add this to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Force polling instead of inotify when running in Docker on Windows
  },
};
```

Or set the environment variable in `docker-compose.dev.yml`:

```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

### Port 3000 already in use

```bash
# Find the process using port 3000
netstat -ano | findstr :3000        # Windows
lsof -i :3000                       # Mac/Linux

# Or change the host port in docker-compose.dev.yml
ports:
  - "3001:3000"
```

### node_modules conflicts after switching branches

If `package.json` changed between branches, the cached `nm` volume may be stale:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

### Production build fails — "output: standalone not set"

The production `Dockerfile` requires `output: "standalone"` in `next.config.ts`. See Phase 2 of the Docker setup guide.

### Image is large

Confirm the builder is using `output: "standalone"`. Without it, the final image includes all of `node_modules` (~1 GB). With it, the runner stage is ~200–250 MB.

```bash
docker image ls footballke-frontend
```

---

## Cleanup

```bash
# Remove containers and networks (keep volumes)
docker compose down

# Remove containers, networks, and volumes
docker compose down -v

# Remove the built image
docker rmi footballke-frontend

# Remove all unused Docker resources (careful — affects all projects)
docker system prune -f
```

---

## Next: adding the backend

When the backend service is ready:

1. Uncomment the `backend` and `db` blocks in `docker-compose.yml`
2. Update `frontend.depends_on` to include `backend`
3. Set `NEXT_PUBLIC_API_URL` to `http://backend:8000/api` (internal DNS — no host port needed)
4. Add `backend` to the `internal` network
