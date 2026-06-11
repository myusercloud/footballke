"use client";

import { useState, useEffect } from "react";
import { addDebugListener, type DebugEntry } from "@/lib/analytics/analytics";

// ── AnalyticsDebugPanel ───────────────────────────────────────────────────────
// Floating overlay that shows every track() call in real time.
// Only rendered when NEXT_PUBLIC_ANALYTICS_DEBUG=true.
// Events with a lime name were sent to PostHog; amber means no-op'd
// (no key set, DNT active, etc.) — useful for local dev without a key.

export function AnalyticsDebugPanel() {
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    return addDebugListener((entry) =>
      setEntries((prev) => [entry, ...prev].slice(0, 50))
    );
  }, []);

  if (closed) return null;

  return (
    <div
      role="log"
      aria-label="Analytics debug panel"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] w-80 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 text-xs text-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" aria-hidden="true" />
          <span className="font-mono font-bold tracking-tight text-lime-300">
            Analytics Debug
          </span>
          <span className="rounded-full bg-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEntries([])}
            title="Clear events"
            className="text-zinc-500 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
          >
            Clear
          </button>
          <button
            onClick={() => setMinimized((m) => !m)}
            title={minimized ? "Expand" : "Minimise"}
            className="text-zinc-500 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
            aria-expanded={!minimized}
          >
            {minimized ? "▲" : "▼"}
          </button>
          <button
            onClick={() => setClosed(true)}
            title="Close"
            className="text-zinc-500 transition-colors hover:text-white focus:outline-none focus-visible:text-white"
            aria-label="Close analytics debug panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Event list */}
      {!minimized && (
        <div className="max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="px-3 py-6 text-center text-zinc-600">
              Waiting for events…
            </p>
          ) : (
            entries.map((entry, i) => (
              <DebugRow key={i} entry={entry} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── DebugRow ──────────────────────────────────────────────────────────────────

function DebugRow({ entry }: { entry: DebugEntry }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Strip base properties — they're identical on every event and clutter the view.
  const BASE_PROPS = new Set(["page_path", "page_title", "referrer", "device_type", "session_id"]);
  const eventProps = Object.fromEntries(
    Object.entries(entry.properties).filter(([k]) => !BASE_PROPS.has(k))
  );

  return (
    <div className="border-b border-zinc-800/60 last:border-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-zinc-900 focus:outline-none focus-visible:bg-zinc-900"
        aria-expanded={expanded}
      >
        <span
          className={`font-mono font-bold ${
            entry.captured ? "text-lime-300" : "text-amber-400"
          }`}
        >
          {entry.name}
        </span>
        <div className="flex shrink-0 items-center gap-2 pl-2">
          <span className="text-[10px] tabular-nums text-zinc-600">{time}</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              entry.captured ? "bg-lime-500" : "bg-amber-500"
            }`}
            title={entry.captured ? "Sent to PostHog" : "No-op (no key / DNT)"}
            aria-label={entry.captured ? "captured" : "dropped"}
          />
        </div>
      </button>

      {expanded && (
        <pre className="max-h-40 overflow-auto bg-zinc-900/60 px-3 pb-2 pt-1 font-mono text-[10px] leading-relaxed text-zinc-400">
          {Object.keys(eventProps).length > 0
            ? JSON.stringify(eventProps, null, 2)
            : "(no event-specific properties)"}
        </pre>
      )}
    </div>
  );
}
