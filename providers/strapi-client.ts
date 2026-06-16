// Server-side HTTP client for the Strapi v5 REST API.
// Never used in client components — STRAPI_URL and STRAPI_API_TOKEN are server-only vars.

const BASE = (process.env.STRAPI_URL ?? 'http://localhost:3001').replace(/\/$/, '') + '/api'
const TOKEN = process.env.STRAPI_API_TOKEN

export async function strapiGet<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Strapi ${res.status} ${res.statusText} — ${url}`)
  return res.json() as Promise<T>
}

// Strapi v5 wraps collections in { data: T[], meta: { pagination: {...} } }
export type StrapiList<T> = {
  data: T[]
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } }
}
