import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the production Docker image.
  // Emits .next/standalone — a self-contained server with only the files
  // that are actually needed at runtime. public/ and .next/static/ are
  // copied separately in the Dockerfile runner stage.
  output: "standalone",
  images: {
    remotePatterns: [
      // Strapi CMS local dev — media uploads served from the CMS container
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
      // Strapi Cloud production (API host + media CDN host)
      { protocol: "https", hostname: "*.strapiapp.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "*.media.strapiapp.com", pathname: "/**" },
      // Cloudinary CDN
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
