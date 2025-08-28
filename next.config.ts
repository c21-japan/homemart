import path from "path";
import type { NextConfig } from "next";

const isClerkDisabled = process.env.DISABLE_CLERK === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { 
    serverActions: { bodySizeLimit: '10mb' as any },
    optimizePackageImports: ["@clerk/nextjs"]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
  trailingSlash: false,
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    if (isClerkDisabled) {
      // Clerkシム
      config.resolve.alias["@clerk/nextjs"] = path.resolve(
        __dirname,
        "lib/shims/clerk-nextjs.ts"
      );
      // ミドルウェア実体を通過版に
      config.resolve.alias["/lib/middleware/entry"] = path.resolve(
        __dirname,
        "lib/middleware/pass-through.ts"
      );
      config.resolve.alias["@/lib/middleware/entry"] = path.resolve(
        __dirname,
        "lib/middleware/pass-through.ts"
      );
    } else {
      // 本番/通常はwith-clerk
      config.resolve.alias["/lib/middleware/entry"] = path.resolve(
        __dirname,
        "lib/middleware/with-clerk.ts"
      );
      config.resolve.alias["@/lib/middleware/entry"] = path.resolve(
        __dirname,
        "lib/middleware/with-clerk.ts"
      );
    }

    return config;
  },
};

export default nextConfig;
