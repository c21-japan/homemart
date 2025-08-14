import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Supabase認証を使用
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !user || !session) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // 管理者権限を確認
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single()

    if (adminError || !adminUser) {
      // 管理者権限がない場合はログアウト
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: '管理者権限がありません' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      session: session
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
