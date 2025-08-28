import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 採用ページは常に通過
  if (request.nextUrl.pathname.startsWith('/recruit')) {
    return NextResponse.next()
  }

  // その他のページも一旦全て通過（Clerk無効時）
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
