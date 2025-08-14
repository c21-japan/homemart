import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 権限が必要なルート定義
const protectedRoutes = {
  '/admin/users': ['user.read'],
  '/admin/properties': ['property.read'],
  '/admin/leads': ['lead.read'],
  '/admin/reports': ['report.view'],
  '/admin/settings': ['system.manage'],
  '/admin/attendance': ['attendance.read']
};

// ログインページとAPIルートは認証不要
const publicRoutes = [
  '/admin/login',
  '/api/auth/login',
  '/api/auth/logout'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ログインページとAPIルートは認証不要
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 管理画面へのアクセスをチェック
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      // 未認証の場合はログインページへリダイレクト
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 権限チェック（実際の実装では Supabase で検証）
    for (const [route, permissions] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        // TODO: セッショントークンからユーザー情報を取得し、権限をチェック
        // const user = await getUserFromSession(sessionToken);
        // const hasPermission = await checkUserPermissions(user.id, permissions);
        // if (!hasPermission) {
        //   return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
        // }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
