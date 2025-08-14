import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // すべての認証Cookieを削除
    cookieStore.delete('admin-auth');
    cookieStore.delete('admin-session');
    
    console.log('ログアウト成功: 認証Cookieを削除しました');
    
    return NextResponse.json({ 
      success: true,
      message: 'ログアウトしました'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'ログアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
