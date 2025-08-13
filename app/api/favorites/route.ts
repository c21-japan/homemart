import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return cookies().getAll();
          },
          async setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookies().set(name, value, options)
              );
            } catch {
              // 無視
            }
          },
        },
      }
    )
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // お気に入り物件を取得
    const { data: favorites, error } = await supabase
      .from('favorite_properties')
      .select(`
        *,
        properties (
          id,
          name,
          price,
          property_type,
          address,
          image_url,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('お気に入り取得エラー:', error)
      return NextResponse.json({ error: 'お気に入りの取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('お気に入り取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return cookies().getAll();
          },
          async setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookies().set(name, value, options)
              );
            } catch {
              // 無視
            }
          },
        },
      }
    )
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { property_id } = await request.json()
    
    if (!property_id) {
      return NextResponse.json({ error: '物件IDが必要です' }, { status: 400 })
    }

    // 物件の存在確認
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: '指定された物件が見つかりません' }, { status: 404 })
    }

    // お気に入りに追加
    const { data: favorite, error } = await supabase
      .from('favorite_properties')
      .insert({
        user_id: user.id,
        property_id: property_id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // 重複エラー
        return NextResponse.json({ error: '既にお気に入りに登録されています' }, { status: 409 })
      }
      console.error('お気に入り追加エラー:', error)
      return NextResponse.json({ error: 'お気に入りの追加に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ favorite, message: 'お気に入りに追加しました' })
  } catch (error) {
    console.error('お気に入り追加エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            return cookies().getAll();
          },
          async setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookies().set(name, value, options)
              );
            } catch {
              // 無視
            }
          },
        },
      }
    )
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const property_id = searchParams.get('property_id')
    
    if (!property_id) {
      return NextResponse.json({ error: '物件IDが必要です' }, { status: 400 })
    }

    // お気に入りから削除
    const { error } = await supabase
      .from('favorite_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', property_id)

    if (error) {
      console.error('お気に入り削除エラー:', error)
      return NextResponse.json({ error: 'お気に入りの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ message: 'お気に入りから削除しました' })
  } catch (error) {
    console.error('お気に入り削除エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
