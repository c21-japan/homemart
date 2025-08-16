import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  // スクロールの動作を改善
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // パフォーマンス最適化
};
export default nextConfig;
