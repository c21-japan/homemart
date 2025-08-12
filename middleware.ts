import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 管理画面のパスかどうかをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // セッションクッキーをチェック
    const isAuthenticated = request.cookies.get('admin-auth')
    
    if (!isAuthenticated || isAuthenticated.value !== 'authenticated') {
      // 認証されていない場合はログインページにリダイレクト
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
