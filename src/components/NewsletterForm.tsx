"use client";

import { useState } from "react";

type EventType = "afcon" | "barca" | "both";

export default function NewsletterForm() {
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [eventType, setEventType] = useState<EventType>("both");
  const [status,    setStatus]    = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit() {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      // POST to your Node/Next.js API route: src/app/api/subscribe/route.ts
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, phone, eventType }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ textAlign: "center", padding: "24px", background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.2)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--brand)", letterSpacing: 2, marginBottom: 8 }}>
          YOU'RE IN
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          We'll alert you the moment AFCON 2027 and Barca vs Liverpool tickets drop.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Event selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["afcon", "barca", "both"] as EventType[]).map((type) => {
          const labels = { afcon: "AFCON 2027", barca: "Barca vs Liverpool", both: "Both events" };
          const active = eventType === type;
          return (
            <button
              key={type}
              onClick={() => setEventType(type)}
              style={{
                flex:         1,
                padding:      "8px 12px",
                borderRadius: "var(--radius-md)",
                border:       `1px solid ${active ? "var(--brand)" : "var(--color-border)"}`,
                background:   active ? "rgba(99,153,34,0.12)" : "transparent",
                color:        active ? "var(--brand)" : "var(--text-secondary)",
                fontFamily:   "var(--font-body)",
                fontSize:     12,
                fontWeight:   active ? 600 : 400,
                cursor:       "pointer",
                transition:   "all 0.2s",
                whiteSpace:   "nowrap",
              }}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>

      {/* Email input */}
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        style={{
          width:        "100%",
          padding:      "14px 18px",
          background:   "rgba(255,255,255,0.05)",
          border:       "1px solid var(--color-border-hover)",
          borderRadius: "var(--radius-md)",
          color:        "var(--text-primary)",
          fontFamily:   "var(--font-body)",
          fontSize:     14,
          outline:      "none",
        }}
      />

      {/* WhatsApp input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>📱</span>
        <input
          type="tel"
          placeholder="+254 7XX XXX XXX (optional — WhatsApp alerts)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            flex:         1,
            padding:      "14px 18px",
            background:   "rgba(255,255,255,0.05)",
            border:       "1px solid var(--color-border-hover)",
            borderRadius: "var(--radius-md)",
            color:        "var(--text-primary)",
            fontFamily:   "var(--font-body)",
            fontSize:     14,
            outline:      "none",
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        style={{
          width:        "100%",
          padding:      "16px",
          background:   status === "loading" ? "var(--color-elevated)" : "var(--brand)",
          color:        status === "loading" ? "var(--text-secondary)" : "var(--text-inverse)",
          border:       "none",
          borderRadius: "var(--radius-md)",
          fontFamily:   "var(--font-body)",
          fontSize:     15,
          fontWeight:   700,
          cursor:       status === "loading" ? "not-allowed" : "pointer",
          letterSpacing: 1,
          transition:   "all 0.2s",
        }}
      >
        {status === "loading" ? "Signing you up..." : "Alert Me When Tickets Drop →"}
      </button>

      {status === "error" && (
        <p style={{ fontSize: 12, color: "var(--barca)", textAlign: "center" }}>
          Something went wrong. Try again or email us directly.
        </p>
      )}

      <p style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.5 }}>
        No spam. Unsubscribe anytime. We'll only contact you when tickets are confirmed.
      </p>
    </div>
  );
}