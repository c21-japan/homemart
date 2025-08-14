import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // パスワードのハッシュ化
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // 認証チェック
    if (username !== ADMIN_USERNAME || passwordHash !== ADMIN_PASSWORD_HASH) {
      console.log('認証失敗:', { username, passwordHash, expectedHash: ADMIN_PASSWORD_HASH });
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが間違っています' },
        { status: 401 }
      );
    }

    // セッショントークン生成
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // レスポンスを作成
    const response = NextResponse.json({ 
      success: true,
      message: 'ログインに成功しました',
      user: {
        username: username,
        role: 'admin'
      }
    });

    // Cookieを設定
    response.cookies.set('admin-auth', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24時間
      path: '/'
    });

    console.log('ログイン成功:', { username, role: 'admin' });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
