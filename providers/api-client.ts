// Shared HTTP client for all API providers.
// Uses native fetch (available in Next.js server components).
// Throws on non-2xx responses with a descriptive error.

const BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '') + '/api';

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...(init?.headers ?? {}),
    },
    // Next.js cache tags can be added here if ISR is used in future
    next: { revalidate: 60 }, // 60-second stale-while-revalidate
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}
