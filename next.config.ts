import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache busting - force fresh assets
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
