import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth/auth-service';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (sessionToken) {
      // 認証サービスでログアウト処理
      const authService = new AuthService();
      await authService.logout(sessionToken);
    }

    // レスポンスを作成
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました'
    });

    // セッションCookieを削除
    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'ログアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
