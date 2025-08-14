import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ログインページとAPIルートは認証不要
  if (pathname === '/admin/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 管理画面へのアクセスをチェック
  if (pathname.startsWith('/admin')) {
    const adminAuth = request.cookies.get('admin-auth');
    
    if (!adminAuth) {
      // 未認証の場合はログインページへリダイレクト
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
