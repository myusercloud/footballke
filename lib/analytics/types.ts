// ── Primitive types ───────────────────────────────────────────────────────────

export type DeviceType = "mobile" | "tablet" | "desktop";

// ── Base properties ───────────────────────────────────────────────────────────
// Automatically attached to every event by analytics.ts.
// Components never build these manually — track() enriches the payload.

export type BaseProperties = {
  /** Current URL pathname + search string. */
  page_path: string;
  /** document.title at the time of the event. */
  page_title: string;
  /** document.referrer — empty string on direct navigation. */
  referrer: string;
  /** Derived from viewport width: <768px → mobile, <1024px → tablet, else desktop. */
  device_type: DeviceType;
  /** Anonymous UUID persisted in sessionStorage for the duration of the tab session. */
  session_id: string;
};
