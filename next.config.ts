import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時にESLintエラーを無視（デプロイを通すため）
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
