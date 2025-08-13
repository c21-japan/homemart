import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { 
    serverActions: { bodySizeLimit: '10mb' },
    optimizePackageImports: ['@supabase/supabase-js']
  },
  
  // 画像最適化設定
  images: {
    domains: ['homemart-one.vercel.app', 'localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // パフォーマンス最適化
  swcMinify: true,
  compress: true,
  
  // 静的生成の最適化
  generateEtags: false,
  
  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/properties',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
