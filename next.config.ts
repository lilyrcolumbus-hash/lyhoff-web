import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile in $HOME was being
  // picked up otherwise).
  turbopack: { root: import.meta.dirname },
  // Static export so the whole site is plain HTML/CSS/JS for Cloudflare Pages.
  output: "export",
  // /article -> /article/ and emit /article/index.html (clean URLs on Cloudflare).
  trailingSlash: true,
  // Required for `output: export` — no Image Optimization server at runtime.
  images: {
    unoptimized: true,
    // Photos uploaded from the admin panel are served from Supabase Storage.
    // Declared even though optimization is off, so next/image never refuses a
    // remote src if that ever changes.
    remotePatterns: [{ protocol: "https", hostname: "egxtilwjhfhohrhcjgbe.supabase.co" }],
  },
};

export default nextConfig;
