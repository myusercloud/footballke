# FootballKE CMS — Editor Guide

> Payload CMS v3. Admin panel at `http://localhost:3001/admin` (dev) or `https://cms.footballke.com/admin` (prod).

---

## Roles

| Role | Can do |
|------|--------|
| **Admin** | Everything: manage users, collections, settings, delete any content |
| **Editor** | Create, edit, publish, schedule all content types; manage media |
| **Author** | Create drafts; submit for review; cannot publish |

---

## Logging In

1. Open `http://localhost:3001/admin`
2. Enter your email and password
3. First-time setup: create the first admin user during `npm run dev` startup

---

## Creating an Article

1. Click **Articles** in the left sidebar
2. Click **Create New**
3. Fill in all required fields:
   - **Title** — headline
   - **Slug** — auto-generated from title; do not change after publishing
   - **Excerpt** — 1–2 sentence teaser (max 300 chars)
   - **Cover Image** — upload from Media or select existing (1200×630 recommended)
   - **Content** — rich-text Lexical editor (supports headings, images, quotes, lists)
   - **Author** — select from Authors list
   - **Category** — select from Categories list
4. In the sidebar:
   - Set **Status** to `Draft` (default) or `Published`
   - Toggle **Featured** if this should appear in the homepage hero
   - Set **Published At** (leave blank to publish immediately)
5. Click **Save** (saves as draft) or change Status to **Published** and Save

### Draft Preview

Click **Preview** (top right) to open the live article preview in the frontend without publishing.

---

## Uploading Media

1. Click **Media** in the left sidebar
2. Click **Create New** or drag-and-drop files
3. Fill in **Alt text** (required for accessibility)
4. System automatically creates thumbnail (400×300), card (768×512), and hero (1920×1080) sizes

For Cloudinary integration: set `CLOUDINARY_*` env vars in the CMS `.env`. Media then uploads to Cloudinary CDN automatically and the `cloudinaryUrl` field is populated.

---

## Updating Standings

1. Click **Standings** in the left sidebar
2. Find the KPL 2025/26 entry
3. Scroll to **Table rows** section
4. Edit each row's `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, and `form` fields
5. Click **Save**

> The frontend service layer calculates positions, goal difference, and zones automatically from raw stats.

---

## Adding a Player

1. Click **Players** in the left sidebar
2. Click **Create New**
3. Fill in all fields — required: `name`, `slug`, `jerseyNumber`, `position`, `clubId`, `clubSlug`, `clubName`, `dateOfBirth`, `bio`
4. Upload player photo via the **image** field
5. Enter current season stats
6. Click **Save**

The player will appear in the club's squad list and the players index immediately after saving.

---

## Publishing a Fixture Result

1. Click **Fixtures**
2. Find the fixture (filter by status = `live`)
3. Set **Status** to `fulltime`
4. Enter **Score** (home and away)
5. Optionally add a **Match summary** in the preview field
6. Click **Save**

---

## Content Flow

```
CMS Editor (Payload Admin)
    │ writes to
    ▼
PostgreSQL (shared DB, schema: cms)
    │ read by
    ▼
NestJS API (reads from schema: public)
    │ served to
    ▼
Next.js Frontend (APIXxxProvider → service → page)
```

> Note: Payload uses the `cms` PostgreSQL schema; Prisma (NestJS API) uses the `public` schema. They share the same database instance but do not share tables.
>
> **To sync CMS content to the API layer**: use the NestJS seed scripts to copy content from JSON files into the Prisma tables. Once the CMS → API webhook integration is complete, this will happen automatically on publish.
