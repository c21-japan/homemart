/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的生成を無効化
  output: 'standalone',
  
  // 実験的機能を有効化
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'homemart.vercel.app'],
    },
  },
  
  // 画像最適化を無効化（開発環境）
  images: {
    unoptimized: true,
  },
  
  // 静的ページの生成を無効化
  trailingSlash: false,
  

}

module.exports = nextConfig
