/**
 * footballke.com — Master Design Tokens
 * Single source of truth for all design decisions.
 * Import this into tailwind.config.js, CSS vars, and components.
 */

const theme = {

  // ─── COLORS ──────────────────────────────────────────────────────────────
  colors: {

    // Base backgrounds — dark-first design
    base: {
      page:    "#0a1a0a",   // pitch black (green-tinted dark, never pure #000)
      surface: "#111711",   // content area background
      card:    "#161e16",   // card surfaces, article backgrounds
      elevated:"#1c261c",   // modals, dropdowns, elevated elements
      border:  "#1f2e1f",   // default border color
      borderHover: "#2d422d", // border on hover
    },

    // Primary — Field Green
    green: {
      50:  "#EAF3DE",  // turf mist — light backgrounds, success fills
      100: "#C0DD97",  // light green
      200: "#97C459",  // lime accent — hover states, highlights
      400: "#639922",  // field green — PRIMARY BRAND COLOR
      600: "#3B6D11",  // deep green — pressed states
      800: "#27500A",  // forest — text on green backgrounds
      900: "#173404",  // midnight green
    },

    // Secondary — Amber Gold (AFCON)
    amber: {
      50:  "#FAEEDA",  // soft amber — AFCON light backgrounds
      100: "#FAC775",
      200: "#EF9F27",
      400: "#BA7517",  // amber gold — AFCON badges, premium markers
      600: "#854F0B",  // deep amber
      800: "#633806",
      900: "#412402",
    },

    // Accent — Match Red (Barca / Liverpool / Breaking)
    red: {
      50:  "#FAECE7",  // soft red — alert fills
      100: "#F5C4B3",
      200: "#F0997B",
      400: "#D85A30",  // match red — Barca/Liverpool, breaking news
      600: "#993C1D",  // deep red
      800: "#712B13",
      900: "#4A1B0C",
    },

    // Info — Sky Blue (links, stadium info)
    blue: {
      50:  "#E6F1FB",
      100: "#B5D4F4",
      200: "#85B7EB",
      400: "#378ADD",  // sky blue — hyperlinks, info tooltips
      600: "#185FA5",
      800: "#0C447C",
      900: "#042C53",
    },

    // Neutral — Stadium Gray
    gray: {
      50:  "#F1EFE8",
      100: "#D3D1C7",
      200: "#B4B2A9",
      400: "#888780",  // stadium gray — muted text, captions
      600: "#5F5E5A",
      800: "#444441",
      900: "#2C2C2A",
    },

    // Semantic shortcuts (import these in components)
    brand:      "#639922",   // = green.400
    brandHover: "#97C459",   // = green.200
    afcon:      "#BA7517",   // = amber.400
    barca:      "#D85A30",   // = red.400
    link:       "#378ADD",   // = blue.400
    muted:      "#888780",   // = gray.400

    // Text hierarchy
    text: {
      primary:   "#F0F5EE",  // near-white with green tint
      secondary: "#9AAD92",  // muted body text
      tertiary:  "#627559",  // captions, timestamps
      inverse:   "#0a1a0a",  // text on light backgrounds
      brand:     "#639922",  // green text
      gold:      "#BA7517",  // gold text (AFCON)
      red:       "#D85A30",  // red text (Barca/breaking)
    },

    // Ad slot backgrounds (reserved zones — never change these)
    ads: {
      leaderboard: "transparent",  // 728×90 top — sits on page bg
      sidebarTop:  "transparent",  // 300×250 — most valuable slot
      sidebarMid:  "transparent",  // 300×200
      inline:      "transparent",  // 468×60 after article 3
      mobileFooter:"transparent",  // 320×50 sticky
    },
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────────────────────
  typography: {

    fonts: {
      display: "'Bebas Neue', sans-serif",  // headlines, scores, countdowns
      body:    "'DM Sans', sans-serif",     // body, nav, captions, UI
      mono:    "'JetBrains Mono', 'Fira Code', monospace", // code blocks
    },

    // Google Fonts import URL — add to <head> or use next/font
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap",

    scale: {
      // Display — Bebas Neue
      heroXl:   { size: "96px",  lh: "0.95", ls: "4px",  font: "display" },
      hero:     { size: "72px",  lh: "0.95", ls: "3px",  font: "display" },
      sectionTitle: { size: "48px", lh: "1",   ls: "2px", font: "display" },
      cardTitle:    { size: "32px", lh: "1.05",ls: "1.5px",font:"display" },
      scoreXl:  { size: "80px",  lh: "1",    ls: "6px",  font: "display" },
      score:    { size: "48px",  lh: "1",    ls: "4px",  font: "display" },
      countdown:{ size: "56px",  lh: "1",    ls: "3px",  font: "display" },

      // Body — DM Sans
      articleTitle: { size: "22px", lh: "1.35", weight: "600", font: "body" },
      body:         { size: "16px", lh: "1.8",  weight: "400", font: "body" },
      bodyLg:       { size: "18px", lh: "1.75", weight: "400", font: "body" },
      bodySm:       { size: "14px", lh: "1.65", weight: "400", font: "body" },
      label:        { size: "11px", lh: "1",    weight: "700", ls: "3px", transform: "uppercase", font: "body" },
      caption:      { size: "12px", lh: "1.4",  weight: "400", font: "body" },
      nav:          { size: "13px", lh: "1",    weight: "500", font: "body" },
      button:       { size: "14px", lh: "1",    weight: "700", ls: "0.5px", font: "body" },
      badge:        { size: "10px", lh: "1",    weight: "700", ls: "2px", transform: "uppercase", font: "body" },
    },
  },

  // ─── SPACING ─────────────────────────────────────────────────────────────
  spacing: {
    // Base unit: 4px
    1:  "4px",
    2:  "8px",
    3:  "12px",
    4:  "16px",
    5:  "20px",
    6:  "24px",
    8:  "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",

    // Semantic
    pagePadding:     "24px",  // left/right page padding
    sectionGap:      "80px",  // between major sections
    cardPadding:     "24px",  // internal card padding
    cardPaddingSm:   "16px",  // compact card padding
    navHeight:       "68px",  // fixed nav height — also used as scroll-padding-top
    footerPadding:   "64px",
  },

  // ─── BORDER RADIUS ───────────────────────────────────────────────────────
  radius: {
    sm:   "6px",
    md:   "10px",
    lg:   "16px",
    xl:   "24px",
    full: "9999px",  // pills, badges
  },

  // ─── BREAKPOINTS ─────────────────────────────────────────────────────────
  breakpoints: {
    sm:  "640px",   // large phone landscape
    md:  "768px",   // tablet
    lg:  "1024px",  // small desktop — sidebar kicks in here
    xl:  "1280px",  // standard desktop
    "2xl": "1536px",// wide desktop
  },

  // ─── AD SLOT DIMENSIONS ──────────────────────────────────────────────────
  // Pre-define these so CLS = 0 (never let ads cause layout shift)
  adSlots: {
    leaderboard: { w: "728px",  h: "90px",  mobile: false, note: "Above fold header — best for direct sponsors" },
    sidebarTop:  { w: "300px",  h: "250px", mobile: false, note: "Highest CPM — never remove this slot" },
    sidebarMid:  { w: "300px",  h: "200px", mobile: false, note: "Second sidebar unit" },
    inline:      { w: "468px",  h: "60px",  mobile: false, note: "After article 3 — highest engagement" },
    mobileFooter:{ w: "320px",  h: "50px",  mobile: true,  note: "Sticky bottom — can double mobile revenue" },
    mobileInline:{ w: "320px",  h: "100px", mobile: true,  note: "Mobile inline between articles" },
  },

  // ─── Z-INDEX SCALE ───────────────────────────────────────────────────────
  zIndex: {
    base:       0,
    raised:     10,    // cards on hover
    dropdown:   100,   // nav dropdowns
    sticky:     200,   // sticky ad footer, sticky nav
    overlay:    300,   // modal backdrops
    modal:      400,   // modals
    toast:      500,   // notifications
    tooltip:    600,   // tooltips
  },

  // ─── ANIMATIONS ──────────────────────────────────────────────────────────
  animation: {
    // Durations
    fast:   "150ms",
    normal: "250ms",
    slow:   "400ms",
    slower: "600ms",

    // Easings
    ease:      "cubic-bezier(0.4, 0, 0.2, 1)",  // standard
    easeIn:    "cubic-bezier(0.4, 0, 1, 1)",
    easeOut:   "cubic-bezier(0, 0, 0.2, 1)",
    spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)", // bouncy
    sharp:     "cubic-bezier(0.4, 0, 0.6, 1)",
  },

  // ─── SHADOWS ─────────────────────────────────────────────────────────────
  shadows: {
    sm:   "0 1px 3px rgba(0,0,0,0.4)",
    md:   "0 4px 16px rgba(0,0,0,0.5)",
    lg:   "0 8px 32px rgba(0,0,0,0.6)",
    glow: {
      green:  "0 0 24px rgba(99,153,34,0.25)",
      amber:  "0 0 24px rgba(186,117,23,0.25)",
      red:    "0 0 24px rgba(216,90,48,0.25)",
    },
  },

  // ─── CONTENT LIMITS ──────────────────────────────────────────────────────
  maxWidth: {
    page:    "1280px",  // outer page container
    content: "760px",   // article body max-width (optimal reading ~70ch)
    narrow:  "560px",   // newsletter, centered CTAs
  },

  // ─── LAYOUT GRID ─────────────────────────────────────────────────────────
  layout: {
    // Article page: main content + sidebar
    articleGrid:  "1fr 320px",      // main / sidebar
    articleGap:   "32px",
    sidebarWidth: "320px",

    // Card grids
    newsGrid3: "repeat(3, 1fr)",   // desktop news cards
    newsGrid2: "repeat(2, 1fr)",   // tablet
    newsGrid1: "1fr",              // mobile
    cardGap:   "20px",
  },

  // ─── SEO ─────────────────────────────────────────────────────────────────
  seo: {
    siteName:    "Football KE",
    siteUrl:     "https://www.footballke.com",
    defaultTitle:"Football KE — AFCON 2027 & Barcelona vs Liverpool in Nairobi",
    titleTemplate:"%s | Football KE",
    description: "Kenya's #1 football guide. Complete coverage of AFCON 2027, Barcelona vs Liverpool at Talanta Stadium, tickets, fixtures, fan travel guides and more.",
    twitterHandle:"@footballke",
    locale:      "en_KE",
    themeColor:  "#0a1a0a",
    ogImage:     "/og-default.jpg",  // 1200×630px
  },

  // ─── PERFORMANCE BUDGETS ─────────────────────────────────────────────────
  performance: {
    maxPageWeightKb:  500,   // total page weight target
    maxImageKb:       120,   // per-image budget
    maxBundleKb:      200,   // JS bundle target
    lcp:              2500,  // ms
    cls:              0.1,
    fid:              100,   // ms
    imageFormats:     ["webp", "avif"],
    lazyLoadOffset:   "200px", // start loading images this far before viewport
  },

};

module.exports = theme;

// ─── NAMED EXPORTS for selective imports ─────────────────────────────────────
module.exports.colors      = theme.colors;
module.exports.typography  = theme.typography;
module.exports.spacing     = theme.spacing;
module.exports.radius      = theme.radius;
module.exports.breakpoints = theme.breakpoints;
module.exports.adSlots     = theme.adSlots;
module.exports.zIndex      = theme.zIndex;
module.exports.animation   = theme.animation;
module.exports.shadows     = theme.shadows;
module.exports.maxWidth    = theme.maxWidth;
module.exports.layout      = theme.layout;
module.exports.seo         = theme.seo;
module.exports.performance = theme.performance;