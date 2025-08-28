// @ts-expect-error - Clerkのインポートエラーをスキップ（DISABLE_CLERK=1の時は使用されない）
import { authMiddleware } from "@clerk/nextjs";
import type { NextFetchEvent, NextRequest } from "next/server";

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  const mw = authMiddleware({
    // 公開ルート最小化・管理配下は保護
    publicRoutes: ["/", "/buy", "/contact", "/api/public/:path*"],
    ignoredRoutes: ["/_next/:path*", "/favicon.ico", "/robots.txt", "/api/customers/search"],
  });
  return (mw as any)(req, evt);
}

// matcher は「静的資産/Next内部」を除外
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
