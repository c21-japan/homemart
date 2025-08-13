import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { endpoint, p256dh, auth } = await request.json()

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 })
    }

    // 既存のサブスクリプションをチェック
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)
      .single()

    if (existingSubscription) {
      // 既存のサブスクリプションを更新
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          p256dh,
          auth,
          created_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ error: 'サブスクリプションの更新に失敗しました' }, { status: 500 })
      }
    } else {
      // 新しいサブスクリプションを作成
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: user.id,
          endpoint,
          p256dh,
          auth
        }])

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json({ error: 'サブスクリプションの作成に失敗しました' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in webpush subscribe API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'エンドポイントは必須です' }, { status: 400 })
    }

    // サブスクリプションを削除
    const { error: deleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (deleteError) {
      console.error('Error deleting subscription:', deleteError)
      return NextResponse.json({ error: 'サブスクリプションの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in webpush unsubscribe API:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
