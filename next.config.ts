import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "meionovels.com",
      },
      {
        protocol: "https",
        hostname: "*.meionovels.com",
      },
      {
        protocol: "https",
        hostname: "meionovel.id",
      },
    ],
  },
};

export default nextConfig;
