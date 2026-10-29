import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Admin uploads one product photo per request (max 5 MB, checked in the action) plus form overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
