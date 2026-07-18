import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "meionovels.com" },
      { protocol: "https", hostname: "*.meionovels.com" },
      { protocol: "https", hostname: "meionovel.id" },
    ],
  },
  async headers() {
    return [
      {
        source: "/novel/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=120, s-maxage=1800, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/api/novel",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
