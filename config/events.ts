// ── Event configuration ───────────────────────────────────────────────────────
//
// Controls which tournament/event sections are shown on the homepage and
// throughout the site. Set enabled: false to suppress a section without
// touching any component or page code.
//
// Future tournaments:
//   afcon:  { enabled: false, featured: false, slug: "afcon-2027", label: "AFCON 2027" }
//   chan:   { enabled: false, featured: false, slug: "chan-2026",  label: "CHAN 2026"  }
//   cecafa: { enabled: false, featured: false, slug: "cecafa",     label: "CECAFA Cup" }

export const eventConfig = {
  worldCup: {
    /** Show the World Cup highlight section on the homepage. */
    enabled: true,
    /** Pin this section above other homepage sections. */
    featured: true,
    /** Route segment — links to /${slug}. */
    slug: "world-cup",
    /** Human-readable label used in headings and CTAs. */
    label: "2026 FIFA World Cup",
    /** Short label for compact UI (badges, nav). */
    shortLabel: "World Cup",
  },
} as const;

export type EventKey = keyof typeof eventConfig;
