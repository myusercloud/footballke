/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── Output & Rendering ────────────────────────────────────────────────────
  reactStrictMode: true,

  // ── Image Optimization ────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 64, 128, 256, 320],
    minimumCacheTTL: 86400, // 24hrs
    remotePatterns: [
      // Cloudinary — your image CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // API-Football team logos
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/**",
      },
      // CAF / FIFA official media
      {
        protocol: "https",
        hostname: "digitalhub.fifa.com",
        pathname: "/**",
      },
    ],
  },

  // ── HTTP Headers ─────────────────────────────────────────────────────────
  // Security + cache control for better Core Web Vitals
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          // Performance hint for Google AdSense
          { key: "Permissions-Policy",        value: "interest-cohort=()" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache images
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // SEO: redirect www to non-www (or vice versa — pick one, stick to it)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.footballke.com" }],
        destination: "https://footballke.com/:path*",
        permanent: true,
      },
    ];
  },

  // ── Webpack Optimizations ────────────────────────────────────────────────
  webpack: (config, { isServer }) => {
    // Bundle analyzer — run: ANALYZE=true npm run build
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: "static", openAnalyzer: false })
      );
    }
    return config;
  },

  // ── Compiler ─────────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // ── Environment variables exposed to the browser ─────────────────────────
  // Never put secrets here — only public config
  env: {
    NEXT_PUBLIC_SITE_URL:       process.env.NEXT_PUBLIC_SITE_URL || "https://footballke.com",
    NEXT_PUBLIC_CLOUDINARY_URL: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
    NEXT_PUBLIC_ADSENSE_ID:     process.env.NEXT_PUBLIC_ADSENSE_ID,  // ca-pub-XXXXXXXXXX
    NEXT_PUBLIC_GA_ID:          process.env.NEXT_PUBLIC_GA_ID,       // G-XXXXXXXXXX
    NEXT_PUBLIC_FOOTBALL_API_KEY: process.env.NEXT_PUBLIC_FOOTBALL_API_KEY,
  },
};

module.exports = nextConfig;