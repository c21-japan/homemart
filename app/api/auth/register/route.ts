import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, name, department } = await request.json()

    // メールアドレスの検証
    if (!email.endsWith('@century21.group')) {
      return NextResponse.json(
        { error: '無効なメールアドレス' },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // Supabaseに保存
    const { data, error } = await supabase
      .from('user_registrations')
      .insert({
        email,
        password: hashedPassword,
        name,
        department,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: '登録に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラー' },
      { status: 500 }
    )
  }
}
