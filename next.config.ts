import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the production Docker image.
  // Emits .next/standalone — a self-contained server with only the files
  // that are actually needed at runtime. public/ and .next/static/ are
  // copied separately in the Dockerfile runner stage.
  output: "standalone",
};

export default nextConfig;
