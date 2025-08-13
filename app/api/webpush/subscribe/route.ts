import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json(
        { error: 'subscription は必須です' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのPush購読情報を保存
    const { error } = await supabase
      .from('user_push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Push subscription save error:', error);
      return NextResponse.json(
        { error: '購読情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Web Push subscribe error:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ユーザーのPush購読情報を削除
    const { error } = await supabase
      .from('user_push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Push subscription delete error:', error);
      return NextResponse.json(
        { error: '購読情報の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Web Push unsubscribe error:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
      );
  }
}
