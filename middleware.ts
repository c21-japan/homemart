import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error - Clerkのインポートエラーをスキップ（DISABLE_CLERK=1の時は使用されない）
import { authMiddleware } from '@clerk/nextjs'

const DISABLE = process.env.DISABLE_CLERK === '1'

export default function middleware(request: NextRequest) {
  // 採用系などは常に通過
  if (request.nextUrl.pathname.startsWith('/recruit')) {
    return NextResponse.next()
  }
  // Clerk無効フラグのときは全通過（ローカル/検証）
  if (DISABLE) return NextResponse.next()
  // 本番は /admin/* を保護
  const mw = authMiddleware({
    publicRoutes: ["/", "/buy", "/contact", "/api/public/:path*"],
    ignoredRoutes: ["/_next/:path*", "/favicon.ico", "/robots.txt", "/api/customers/search"],
  });
  return (mw as any)(request);
}

export const config = {
  matcher: ['/admin/(.*)', '/member/(.*)', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
