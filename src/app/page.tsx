// src/app/page.tsx
// footballke.com — Homepage (Server Component)
// Interactive islands: CountdownTimer (client), NewsletterForm (client)

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import NewsletterForm from "@/components/NewsletterForm";
import AdSlot from "@/components/AdSlot";

// ─── Page-level SEO ──────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Football KE — AFCON 2027 & Barcelona vs Liverpool in Nairobi",
  description:
    "Kenya's #1 football guide. Complete coverage of AFCON 2027, Barcelona vs Liverpool at Talanta Stadium, tickets, travel guides, and live updates.",
  alternates: { canonical: "https://footballke.com" },
  openGraph: { url: "https://footballke.com" },
};

// ─── Static data (replace with DB/API calls when backend is ready) ───────────
const NEWS = [
  {
    slug:     "afcon-2027-dates-confirmed",
    tag:      "AFCON 2027",
    tagColor: "var(--brand)",
    tagBg:    "rgba(99,153,34,0.12)",
    headline: "AFCON 2027 Officially Confirmed: June 19 – July 17 Across East Africa",
    summary:  "CAF has ratified the full tournament window. Kenya, Uganda and Tanzania become the first three-nation AFCON co-hosts in the tournament's 68-year history.",
    date:     "May 5, 2026",
    readTime: "3 min",
    featured: true,
  },
  {
    slug:     "barcelona-liverpool-nairobi-update",
    tag:      "Barca vs Liverpool",
    tagColor: "var(--barca)",
    tagBg:    "rgba(216,90,48,0.12)",
    headline: "Barcelona vs Liverpool at Talanta: FKF Confirms Talks Are at Final Stage",
    summary:  "Federation of Kenya Football says commercial agreements are 90% complete. August 8 remains the target date for the historic pre-season friendly.",
    date:     "May 3, 2026",
    readTime: "4 min",
    featured: true,
  },
  {
    slug:     "talanta-stadium-construction-update",
    tag:      "Infrastructure",
    tagColor: "var(--afcon)",
    tagBg:    "rgba(186,117,23,0.12)",
    headline: "Talanta Stadium Hits 94% Completion — Seat Installation Begins",
    summary:  "Final phase of construction is underway. The 60,000-seat football-only venue along Thika Road is on track for an August handover.",
    date:     "Apr 30, 2026",
    readTime: "5 min",
    featured: false,
  },
  {
    slug:     "harambee-stars-afcon-qualification",
    tag:      "Harambee Stars",
    tagColor: "var(--link)",
    tagBg:    "rgba(55,138,221,0.12)",
    headline: "Harambee Stars Are Automatically In — But Here's the Full Co-Host Rule Explained",
    summary:  "Kenya, Uganda, and Tanzania qualify automatically as co-hosts, but there are nuances around group stage seeding and fixture allocation you need to know.",
    date:     "Apr 28, 2026",
    readTime: "6 min",
    featured: false,
  },
  {
    slug:     "afcon-2027-venues-guide",
    tag:      "Fan Guide",
    tagColor: "var(--brand)",
    tagBg:    "rgba(99,153,34,0.12)",
    headline: "Every AFCON 2027 Venue in Kenya, Uganda and Tanzania: Capacities, Locations & Travel Tips",
    summary:  "From Talanta Stadium in Nairobi to Mandela National Stadium in Kampala — a complete breakdown of all 6 confirmed venues for AFCON 2027.",
    date:     "Apr 25, 2026",
    readTime: "8 min",
    featured: false,
  },
  {
    slug:     "lamine-yamal-profile",
    tag:      "Player Profile",
    tagColor: "var(--barca)",
    tagBg:    "rgba(216,90,48,0.12)",
    headline: "Lamine Yamal at 19: Why Africa Should Be Desperate to See Him at Talanta",
    summary:  "The kid who lit up Euro 2024 and won the Ballon d'Or Espoir is now a world-class starter. A Nairobi audience would witness history.",
    date:     "Apr 22, 2026",
    readTime: "5 min",
    featured: false,
  },
];

const STATS = [
  { value: "28",   label: "AFCON Teams",       accent: "var(--brand)" },
  { value: "60K",  label: "Talanta Seats",      accent: "var(--afcon)" },
  { value: "3",    label: "Host Nations",        accent: "var(--brand)" },
  { value: "28",   label: "Days of Football",    accent: "var(--afcon)" },
  { value: "400M+",label: "People Reached",      accent: "var(--brand)" },
  { value: "51",   label: "Years Since Last E.A AFCON", accent: "var(--afcon)" },
];

const TICKER_ITEMS = [
  { match: "Kenya vs Tanzania",       score: "2 – 1", competition: "CECAFA 2026",      status: "FT" },
  { match: "Morocco vs Egypt",        score: "1 – 1", competition: "AFCON Qualifier",  status: "FT" },
  { match: "Nigeria vs Ghana",        score: "–",     competition: "AFCON Qualifier",  status: "Jun 8" },
  { match: "Senegal vs Ivory Coast",  score: "3 – 0", competition: "AFCON Qualifier",  status: "FT" },
  { match: "Uganda vs Ethiopia",      score: "2 – 0", competition: "AFCON Qualifier",  status: "FT" },
  { match: "Algeria vs Tunisia",      score: "–",     competition: "AFCON Qualifier",  status: "Jun 9" },
  { match: "South Africa vs Zambia",  score: "1 – 2", competition: "AFCON Qualifier",  status: "FT" },
  { match: "Cameroon vs DR Congo",    score: "–",     competition: "AFCON Qualifier",  status: "Jun 10" },
];

// ─── Server Component ─────────────────────────────────────────────────────────
export default function HomePage() {
  const featured = NEWS.filter((n) => n.featured);
  const secondary = NEWS.filter((n) => !n.featured);

  return (
    <>
      {/* ── SCORE TICKER ────────────────────────────────────────────────── */}
      <div
        style={{
          background:   "var(--color-surface)",
          borderBottom: "0.5px solid var(--color-border)",
          overflow:     "hidden",
          position:     "relative",
        }}
        aria-label="Live scores ticker"
      >
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to right, var(--color-surface), transparent)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to left, var(--color-surface), transparent)", zIndex: 1, pointerEvents: "none" }} />

        <div className="ticker-track" style={{ display: "flex", padding: "8px 0" }}>
          {/* Duplicate for seamless loop */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="ticker-item">
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: item.status === "FT" ? "var(--text-tertiary)" : "var(--barca)" }}>
                {item.status}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
                {item.match}
              </span>
              <span className="score">{item.score}</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{item.competition}</span>
              <span style={{ width: 1, height: 14, background: "var(--color-border-hover)", display: "inline-block", marginLeft: 16 }} />
            </div>
          ))}
        </div>
      </div>


      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        style={{
          position:   "relative",
          overflow:   "hidden",
          background: "var(--color-page)",
          paddingTop: "clamp(60px, 8vw, 100px)",
          paddingBottom: "clamp(60px, 8vw, 100px)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/images/talanta-stadium-hero.svg"
            alt="Talanta Stadium in Nairobi lit for a major football night"
            fill
            priority
            unoptimized
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 48%", filter: "brightness(0.72) contrast(1.12) saturate(1.08)", opacity: 0.48 }}
          />
        </div>
        {/* Pitch line pattern SVG background */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Centre circle */}
          <circle cx="600" cy="300" r="120" fill="none" stroke="#639922" strokeWidth="2" />
          <circle cx="600" cy="300" r="4" fill="#639922" />
          {/* Halfway line */}
          <line x1="600" y1="0" x2="600" y2="600" stroke="#639922" strokeWidth="2" />
          {/* Outer boundary */}
          <rect x="40" y="40" width="1120" height="520" fill="none" stroke="#639922" strokeWidth="2" />
          {/* Penalty boxes */}
          <rect x="40" y="175" width="180" height="250" fill="none" stroke="#639922" strokeWidth="2" />
          <rect x="980" y="175" width="180" height="250" fill="none" stroke="#639922" strokeWidth="2" />
          <rect x="40" y="225" width="80" height="150" fill="none" stroke="#639922" strokeWidth="2" />
          <rect x="1080" y="225" width="80" height="150" fill="none" stroke="#639922" strokeWidth="2" />
          {/* Goals */}
          <rect x="20" y="260" width="20" height="80" fill="none" stroke="#639922" strokeWidth="2" />
          <rect x="1160" y="260" width="20" height="80" fill="none" stroke="#639922" strokeWidth="2" />
          {/* Corner arcs */}
          <path d="M40,40 Q55,40 55,55" fill="none" stroke="#639922" strokeWidth="2" />
          <path d="M1160,40 Q1145,40 1145,55" fill="none" stroke="#639922" strokeWidth="2" />
          <path d="M40,560 Q55,560 55,545" fill="none" stroke="#639922" strokeWidth="2" />
          <path d="M1160,560 Q1145,560 1145,545" fill="none" stroke="#639922" strokeWidth="2" />
        </svg>

        {/* Radial glow blobs */}
        <div aria-hidden="true" style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "60vw", height: "50vw", maxWidth: 800, background: "radial-gradient(ellipse, rgba(99,153,34,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-5%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(186,117,23,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-5%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(216,90,48,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max)", margin: "0 auto", padding: "0 var(--page-x)" }}>

          {/* Live badge */}
          <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,153,34,0.1)", border: "0.5px solid rgba(99,153,34,0.25)", borderRadius: "var(--radius-full)", padding: "6px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--brand)" }}>
                Live Coverage
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)" }}>
              AFCON 2027 Qualifiers in progress
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "clamp(3.8rem, 11vw, 8.5rem)",
              lineHeight:    0.92,
              letterSpacing: "3px",
              margin:        "0 0 clamp(20px, 3vw, 32px)",
              maxWidth:      960,
            }}
          >
            <span style={{ display: "block", color: "var(--text-primary)" }}>NAIROBI</span>
            <span style={{ display: "block", WebkitTextStroke: "2px var(--brand)", color: "transparent" }}>TAKES CENTRE</span>
            <span style={{ display: "block", color: "var(--brand)" }}>PITCH.</span>
          </h1>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.8vw, 18px)", color: "var(--text-secondary)", maxWidth: 540, lineHeight: 1.75, marginBottom: "clamp(32px, 4vw, 48px)", fontWeight: 300 }}>
            Your complete guide to <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>AFCON 2027</strong> and <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>Barcelona vs Liverpool</strong> at Talanta Stadium, Nairobi. Tickets, travel, fixtures — all in one place.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <Link href="/afcon-2027" style={{ padding: "14px 28px", background: "var(--brand)", color: "var(--text-inverse)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
              AFCON 2027 Guide →
            </Link>
            <Link href="/barcelona-liverpool" style={{ padding: "14px 28px", background: "transparent", color: "var(--text-primary)", border: "0.5px solid var(--color-border-hover)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Barca vs Liverpool →
            </Link>
            <Link href="/tickets" style={{ padding: "14px 28px", background: "rgba(186,117,23,0.12)", color: "var(--afcon)", border: "0.5px solid rgba(186,117,23,0.25)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              🎟 Get Tickets
            </Link>
          </div>

          {/* Dual countdown cards */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

            {/* AFCON */}
            <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.03)", border: "0.5px solid var(--color-border-hover)", borderRadius: "var(--radius-xl)", padding: "clamp(20px,3vw,32px)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(99,153,34,0.15), transparent)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ background: "rgba(99,153,34,0.15)", color: "var(--brand)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
                  ✓ Confirmed
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)" }}>Jun 19 – Jul 17, 2027</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: 1.5, lineHeight: 1.05 }}>
                AFCON 2027
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
                Kenya · Uganda · Tanzania
              </p>
              <CountdownTimer targetDate="2027-06-19T00:00:00" accentColor="var(--brand)" size="lg" />
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "0.5px solid var(--color-border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["28", "Teams"], ["3", "Nations"], ["6+", "Venues"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--brand)", letterSpacing: 2 }}>{v}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-tertiary)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Barca vs Liverpool */}
            <div style={{ flex: 1, minWidth: 280, background: "rgba(255,255,255,0.03)", border: "0.5px solid var(--color-border-hover)", borderRadius: "var(--radius-xl)", padding: "clamp(20px,3vw,32px)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(216,90,48,0.15), transparent)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ background: "rgba(255,214,0,0.12)", color: "#D4A017", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px", borderRadius: "var(--radius-full)" }}>
                  Developing
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)" }}>Aug 8, 2026 (proposed)</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: 1.5, lineHeight: 1.05 }}>
                BARCA VS<br />LIVERPOOL
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
                Talanta Stadium, Nairobi
              </p>
              <CountdownTimer targetDate="2026-08-08T00:00:00" accentColor="var(--barca)" size="lg" />
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "0.5px solid var(--color-border)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(216,90,48,0.7)", background: "rgba(216,90,48,0.06)", border: "0.5px solid rgba(216,90,48,0.15)", borderRadius: "var(--radius-sm)", padding: "8px 12px" }}>
                  ⚠ Not yet officially confirmed. Tracking all updates.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ── LEADERBOARD AD ──────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface)", borderBlock: "0.5px solid var(--color-border)", padding: "12px 0" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "0 var(--page-x)", display: "flex", justifyContent: "center" }}>
          <AdSlot slot="leaderboard" />
        </div>
      </div>


      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface)", borderBottom: "0.5px solid var(--color-border)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "28px var(--page-x)", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{ textAlign: "center", padding: "16px 24px", flex: 1, minWidth: 110, background: "rgba(255,255,255,0.02)", border: "0.5px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: s.accent, letterSpacing: 2 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ── LATEST NEWS + SIDEBAR ───────────────────────────────────────── */}
      <section style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "clamp(48px,6vw,80px) var(--page-x)" }}>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Breaking Stories</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--text-primary)", letterSpacing: 2, lineHeight: 1 }}>
              Latest News
            </h2>
          </div>
          <Link href="/news" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
            All articles →
          </Link>
        </div>

        {/* Main layout: articles + sidebar */}
        <div className="article-grid">

          {/* ── Articles ── */}
          <div>

            {/* 2 featured cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
              {featured.map((article) => (
                <Link key={article.slug} href={`/news/${article.slug}`} style={{ textDecoration: "none" }}>
                  <article
                    className="featured-article-card"
                    style={{
                      background:    "var(--color-card)",
                      border:        "0.5px solid var(--color-border)",
                      borderRadius:  "var(--radius-lg)",
                      padding:       24,
                      height:        "100%",
                      transition:    "border-color 0.25s, background 0.25s",
                      cursor:        "pointer",
                    }}
                  >
                    {/* Placeholder image area */}
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--color-elevated)", borderRadius: "var(--radius-md)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "4rem", color: "var(--color-border-hover)", letterSpacing: 4 }}>⚽</div>
                      {/* Replace with: <Image src={article.image} alt={article.headline} fill style={{ objectFit: "cover" }} /> */}
                    </div>

                    <span style={{ display: "inline-block", background: article.tagBg, color: article.tagColor, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "3px 10px", borderRadius: "var(--radius-full)", marginBottom: 12 }}>
                      {article.tag}
                    </span>

                    <h3 style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.35 }}>
                      {article.headline}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 16px" }}>
                      {article.summary}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)" }}>
                      <time>{article.date}</time>
                      <span>·</span>
                      <span>{article.readTime} read</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Inline ad after 2 featured articles */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <AdSlot slot="inline" />
            </div>

            {/* Remaining articles as list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {secondary.map((article, idx) => (
                <Link key={article.slug} href={`/news/${article.slug}`} style={{ textDecoration: "none" }}>
                  <article
                    style={{
                      display:       "flex",
                      gap:           16,
                      alignItems:    "flex-start",
                      padding:       "16px 0",
                      borderBottom:  idx < secondary.length - 1 ? "0.5px solid var(--color-border)" : "none",
                      transition:    "background 0.2s",
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: 80, height: 60, flexShrink: 0, background: "var(--color-card)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      ⚽
                      {/* Replace with: <Image src={article.image} alt="" width={80} height={60} style={{ objectFit: "cover", borderRadius: "var(--radius-md)" }} /> */}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "inline-block", background: article.tagBg, color: article.tagColor, fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "2px 8px", borderRadius: "var(--radius-full)", marginBottom: 6 }}>
                        {article.tag}
                      </span>
                      <h3 style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {article.headline}
                      </h3>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)", display: "flex", gap: 8 }}>
                        <time>{article.date}</time>
                        <span>· {article.readTime} read</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

          </div>

          {/* ── Sidebar ── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Top sidebar ad — highest CPM */}
            <AdSlot slot="sidebarTop" />

            {/* Upcoming matches widget */}
            <div style={{ background: "var(--color-card)", border: "0.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--text-primary)", letterSpacing: 2, margin: "0 0 16px" }}>
                UPCOMING QUALIFIERS
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { home: "Nigeria", away: "Ghana",   date: "Jun 8",  comp: "Matchday 5" },
                  { home: "Algeria", away: "Tunisia", date: "Jun 9",  comp: "Matchday 5" },
                  { home: "Kenya",   away: "Rwanda",  date: "Jun 10", comp: "Matchday 5" },
                ].map((m) => (
                  <div key={m.home + m.away} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "0.5px solid var(--color-border)" }}>
                    <div style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
                      {m.home} <span style={{ color: "var(--text-tertiary)" }}>vs</span> {m.away}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, color: "var(--brand)" }}>{m.date}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-tertiary)" }}>{m.comp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/afcon-2027/qualifiers" style={{ display: "block", textAlign: "center", marginTop: 14, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
                Full fixture list →
              </Link>
            </div>

            {/* Mid sidebar ad */}
            <AdSlot slot="sidebarMid" />

            {/* Quick ticket info */}
            <div style={{ background: "rgba(186,117,23,0.06)", border: "0.5px solid rgba(186,117,23,0.2)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--afcon)", marginBottom: 12 }}>
                🎟 Ticket Tracker
              </div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: 1.5, margin: "0 0 10px" }}>
                AFCON 2027 TICKETS
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
                Official CAF ticket portal not yet open. Sign up to be first in line.
              </p>
              <Link href="/tickets" style={{ display: "block", padding: "10px 16px", background: "var(--afcon)", color: "var(--text-inverse)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
                Join ticket waitlist
              </Link>
            </div>

          </aside>

        </div>
      </section>


      {/* ── EVENTS DEEP DIVE ────────────────────────────────────────────── */}
      <section style={{ background: "var(--color-surface)", borderBlock: "0.5px solid var(--color-border)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "clamp(48px,6vw,80px) var(--page-x)" }}>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Two Events. One City.</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text-primary)", letterSpacing: 2, lineHeight: 1, margin: 0 }}>
              Everything You Need to Know
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

            {/* AFCON card */}
            <div style={{ background: "var(--color-card)", border: "0.5px solid var(--color-border-hover)", borderRadius: "var(--radius-xl)", padding: "clamp(24px,3vw,36px)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(99,153,34,0.12), transparent)", borderRadius: "50%", pointerEvents: "none" }} />
              <span style={{ display: "inline-block", background: "rgba(99,153,34,0.12)", color: "var(--brand)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px", borderRadius: "var(--radius-full)", marginBottom: 20 }}>
                ✓ Confirmed
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "var(--text-primary)", letterSpacing: 2, margin: "0 0 8px", lineHeight: 1 }}>
                AFCON 2027
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
                June 19 – July 17, 2027 · 3 Nations
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  { icon: "🏟️", text: "6+ venues across Kenya, Uganda & Tanzania" },
                  { icon: "🌍", text: "28 teams — largest AFCON field ever" },
                  { icon: "🎟️", text: "Ticket portal opens Q3 2026" },
                  { icon: "📺", text: "SuperSport & DSTV broadcasting" },
                  { icon: "✈️", text: "Direct flights from 40+ cities to Nairobi" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, lineHeight: 1.4 }}>{item.icon}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/afcon-2027" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--brand)", color: "var(--text-inverse)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Full AFCON Guide →
              </Link>
            </div>

            {/* Barca vs Liverpool card */}
            <div style={{ background: "var(--color-card)", border: "0.5px solid var(--color-border-hover)", borderRadius: "var(--radius-xl)", padding: "clamp(24px,3vw,36px)", position: "relative", overflow: "hidden" }}>
              <div aria-hidden="true" style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(216,90,48,0.12), transparent)", borderRadius: "50%", pointerEvents: "none" }} />
              <span style={{ display: "inline-block", background: "rgba(255,214,0,0.1)", color: "#D4A017", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px", borderRadius: "var(--radius-full)", marginBottom: 20 }}>
                Tracking · Unconfirmed
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "var(--text-primary)", letterSpacing: 2, margin: "0 0 8px", lineHeight: 1 }}>
                BARCA VS<br />LIVERPOOL
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
                Proposed Aug 8, 2026 · Talanta Stadium
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {[
                  { icon: "🌟", text: "Lamine Yamal, Pedri and Lewandowski expected" },
                  { icon: "⚡", text: "Mo Salah, Wirtz and Ekitike for Liverpool" },
                  { icon: "🏟️", text: "60,000-seat Talanta Stadium" },
                  { icon: "💰", text: "Tickets est. Ksh 5,000 – 50,000" },
                  { icon: "📡", text: "Talks at final commercial stage" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, lineHeight: 1.4 }}>{item.icon}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/barcelona-liverpool" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--barca)", color: "#fff", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Track Match Updates →
              </Link>
            </div>

            {/* Talanta Stadium card */}
            <div style={{ background: "linear-gradient(135deg, rgba(99,153,34,0.08), rgba(186,117,23,0.06))", border: "0.5px solid rgba(99,153,34,0.15)", borderRadius: "var(--radius-xl)", padding: "clamp(24px,3vw,36px)" }}>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px", borderRadius: "var(--radius-full)", marginBottom: 20 }}>
                The Venue
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "var(--text-primary)", letterSpacing: 2, margin: "0 0 8px", lineHeight: 1 }}>
                TALANTA<br />STADIUM
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-tertiary)", margin: "0 0 24px" }}>
                Nairobi, Kenya · 60,000 seats
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                {[
                  { value: "60,000", label: "Capacity" },
                  { value: "Ksh 44B", label: "Cost" },
                  { value: "94%", label: "Complete" },
                  { value: "Aug 2026", label: "Handover" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--brand)", letterSpacing: 1.5 }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/talanta-stadium" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", color: "var(--brand)", border: "0.5px solid var(--brand)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Stadium Guide →
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ── WHY IT MATTERS ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "clamp(48px,6vw,80px) var(--page-x)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>

          <div>
            <p className="eyebrow eyebrow-gold" style={{ marginBottom: 16 }}>Why It Matters</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "var(--text-primary)", letterSpacing: 2, lineHeight: 1, margin: "0 0 24px" }}>
              EAST AFRICA'S<br />FIRST AFCON<br />
              <span style={{ color: "var(--afcon)" }}>IN 51 YEARS.</span>
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16, fontWeight: 300 }}>
              The last time the Africa Cup of Nations was held in East Africa, it was <strong style={{ color: "var(--text-primary)" }}>1976 in Ethiopia</strong>. Half a century later, Kenya, Uganda and Tanzania will co-host the continent's biggest tournament.
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300 }}>
              The first three-nation co-host in AFCON history. The expanded 28-team format. A brand new 60,000-seat stadium. This is not just football — it's a generational moment for the region.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🏟️", title: "Africa's Newest Football Cathedral", desc: "Talanta Stadium — 60,000 seats, football-only, no athletics track. Fans 22m closer to the pitch than Kasarani.", accent: "var(--brand)" },
              { icon: "🌍", title: "28 Nations, 400M+ People", desc: "Expanded format brings four more teams than any previous AFCON. Four matches per day at peak.", accent: "var(--afcon)" },
              { icon: "✈️", title: "Global Spotlight on Nairobi", desc: "Fans from Europe, West Africa and the diaspora will flood the city. The world's press follows.", accent: "var(--barca)" },
              { icon: "💸", title: "Ksh 200B+ Economic Impact", desc: "Projected tourism revenue for Kenya alone. Hotels, transport, hospitality — the biggest economic event in East African history.", accent: "var(--brand)" },
            ].map((item) => (
              <div
                key={item.title}
                style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 20px", background: "var(--color-card)", border: "0.5px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ── NEWSLETTER ──────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(180deg, var(--color-page) 0%, rgba(99,153,34,0.04) 50%, var(--color-page) 100%)", borderTop: "0.5px solid var(--color-border)" }}>
        <div style={{ maxWidth: "var(--maxWidth-narrow, 560px)", margin: "0 auto", padding: "clamp(60px,8vw,100px) var(--page-x)", textAlign: "center" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(186,117,23,0.08)", border: "0.5px solid rgba(186,117,23,0.2)", borderRadius: "var(--radius-full)", padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ fontSize: 14 }}>🎟️</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--afcon)" }}>
              Ticket Alert
            </span>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 3.4rem)", color: "var(--text-primary)", letterSpacing: 2, margin: "0 0 14px", lineHeight: 1.05 }}>
            BE FIRST WHEN<br />TICKETS DROP
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
            AFCON 2027 and Barcelona vs Liverpool tickets will sell out within hours. Sign up for instant email and WhatsApp alerts the moment they go live.
          </p>

          <NewsletterForm />

        </div>
      </section>


      {/* ── MOBILE STICKY FOOTER AD ─────────────────────────────────────── */}
      <div
        className="ad-sticky-footer"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", background: "var(--color-surface)", borderTop: "0.5px solid var(--color-border)", padding: "4px 0" }}
      >
        <AdSlot slot="mobileFooter" label={false} />
      </div>
    </>
  );
}
