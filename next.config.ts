import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let Next.js handle caching naturally with content hashes
  // Static assets get immutable caching, HTML pages get revalidation
};

export default nextConfig;
